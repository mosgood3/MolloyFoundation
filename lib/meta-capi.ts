import { createHash } from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function sendMetaEvent({
  eventName,
  eventId,
  sourceUrl,
  email,
  value,
  ipAddress,
  userAgent,
}: {
  eventName: string;
  eventId: string;
  sourceUrl: string;
  email?: string | null;
  value?: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const userData: Record<string, string> = {};
  if (email) userData.em = sha256(email);
  if (ipAddress) userData.client_ip_address = ipAddress;
  if (userAgent) userData.client_user_agent = userAgent;

  const eventData: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: sourceUrl,
    action_source: 'website',
    user_data: userData,
  };

  if (value !== undefined) {
    eventData.custom_data = { value, currency: 'USD' };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [eventData],
          access_token: ACCESS_TOKEN,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error('Meta CAPI error:', res.status, body);
    }
  } catch (err) {
    console.error('Meta CAPI request failed:', err);
  }
}
