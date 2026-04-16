import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseadmin';
import { sendTeamWaiverEmail, sendSinglesWaiverEmail, sendDonationThankYouEmail } from '@/lib/email';
import { sendMetaEvent } from '@/lib/meta-capi';

// NOTE: Idempotency for webhook events should be handled at the database level
// using unique constraints (e.g., a unique stripe_session_id column on donations_2026).
// Stripe may retry webhook deliveries, so DB-level deduplication is the most
// reliable approach—especially across multiple server instances or restarts.

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    console.error('Missing Stripe-Signature header');
    return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
  }

  const rawBody = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Signature verification failed:', errMsg);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const amount = (session.amount_total ?? 0) / 100;

    // Singles no longer go through Stripe — handled by /api/singles directly.
    if (meta.type === 'registration') {
      // ── Team registration ──
      try {
        let players: Array<{ name: string; size: string; email: string }>;
        try {
          players = JSON.parse(meta.players as string);
        } catch {
          console.error('Failed to parse players metadata:', meta.players);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        if (!Array.isArray(players) || players.length !== 3) {
          console.error('Invalid players array in metadata:', players);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        for (let i = 0; i < 3; i++) {
          if (!players[i]?.name || !players[i]?.size) {
            console.error(`Player ${i + 1} is incomplete in metadata`);
            return NextResponse.json({ received: true }, { status: 200 });
          }
        }

        let player4: { name: string; size: string; email: string } | null = null;
        if (meta.player4) {
          try { player4 = JSON.parse(meta.player4); } catch { /* skip */ }
        }

        const teamRow: Record<string, string | null> = {
          team_name: meta.team_name!,
          division: meta.division!,
          team_email: meta.team_email!,
          team_phone: meta.team_phone!,
          player1: players[0].name,
          player2: players[1].name,
          player3: players[2].name,
          player1shirt: players[0].size,
          player2shirt: players[1].size,
          player3shirt: players[2].size,
          player1email: players[0].email,
          player2email: players[1].email,
          player3email: players[2].email,
          player4: player4?.name ?? null,
          player4shirt: player4?.size ?? null,
          player4email: player4?.email ?? null,
        };

        const { error: teamErr } = await supabaseAdmin.from('teams_2026').insert({
          ...teamRow,
          stripe_session_id: session.id,
        });
        if (teamErr) {
          // If duplicate session_id, skip silently (idempotency)
          if (teamErr.code === '23505') {
            console.log('Duplicate webhook for team, skipping:', session.id);
            return NextResponse.json({ received: true }, { status: 200 });
          }
          throw teamErr;
        }
        console.log('Team registered:', teamRow.team_name);

        // Meta CAPI — Register event
        sendMetaEvent({
          eventName: 'Register',
          eventId: session.id,
          sourceUrl: `https://www.matthewcmolloyfoundation.org/success?session_id=${session.id}`,
          email: meta.team_email,
          value: amount,
        }).catch((err) => console.error('Meta CAPI (Register) failed:', err));

        const { error: regErr } = await supabaseAdmin.from('donations_2026').insert({
          amount,
          donor_name: meta.team_name,
          donor_email: meta.team_email,
          source: 'registration',
          stripe_session_id: session.id,
        });
        if (regErr) {
          console.error('Donation insert failed for team:', teamRow.team_name, regErr.message);
        }

        // Send waiver emails to each player individually
        try {
          const allPlayers = players.map((p) => ({
            player_name: p.name,
            player_email: p.email || meta.team_email,
            team_name: meta.team_name,
            registration_type: 'team' as const,
          }));
          if (player4) {
            allPlayers.push({
              player_name: player4.name,
              player_email: player4.email || meta.team_email,
              team_name: meta.team_name,
              registration_type: 'team',
            });
          }

          const { data: waivers, error: waiverErr } = await supabaseAdmin
            .from('waivers_2026')
            .insert(allPlayers)
            .select('token, player_name, player_email');

          if (waiverErr) {
            console.error('Waiver insert failed:', waiverErr.message);
          } else if (waivers) {
            // Send each player their own waiver email
            for (const w of waivers) {
              if (w.player_email) {
                try {
                  await sendSinglesWaiverEmail(w.player_email, w.player_name, w.token);
                  console.log('Waiver email sent to:', w.player_email);
                } catch (e) {
                  console.error('Waiver email failed for:', w.player_name, e);
                }
              }
            }
            // Also send team captain a summary with all links
            if (meta.team_email) {
              await sendTeamWaiverEmail(meta.team_email, meta.team_name!, waivers);
              console.log('Team summary email sent to:', meta.team_email);
            }
          }
        } catch (waiverErr) {
          console.error('Waiver email failed (team):', waiverErr);
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Team registration error:', errMsg);
        return NextResponse.json({ error: 'Registration processing failed' }, { status: 500 });
      }
    } else {
      // ── Direct donation ──
      try {
        const customerEmail = session.customer_details?.email || null;
        const { error: donErr } = await supabaseAdmin.from('donations_2026').insert({
          amount,
          donor_name: meta.donor_name || null,
          donor_email: customerEmail,
          source: 'donation',
          stripe_session_id: session.id,
        });
        if (donErr) {
          // If duplicate session_id, skip silently (idempotency)
          if (donErr.code === '23505') {
            console.log('Duplicate webhook for donation, skipping:', session.id);
            return NextResponse.json({ received: true }, { status: 200 });
          }
          throw donErr;
        }
        console.log('Donation recorded:', amount, meta.donor_name || 'anonymous');

        // Meta CAPI — Donate event
        sendMetaEvent({
          eventName: 'Donate',
          eventId: session.id,
          sourceUrl: `https://www.matthewcmolloyfoundation.org/donate/success?session_id=${session.id}`,
          email: customerEmail,
          value: amount,
        }).catch((err) => console.error('Meta CAPI (Donate) failed:', err));

        // Send thank-you email
        if (customerEmail) {
          try {
            await sendDonationThankYouEmail(customerEmail, amount, meta.donor_name || null);
            console.log('Donation thank-you email sent to:', customerEmail);
          } catch (emailErr) {
            console.error('Donation thank-you email failed:', emailErr);
          }
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Donation flow error:', errMsg);
        return NextResponse.json({ error: 'Donation processing failed' }, { status: 500 });
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Checkout session expired:', session.id, session.metadata);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
