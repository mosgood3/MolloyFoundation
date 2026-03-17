import Header from "@/components/header";
import Footer from "@/components/footer";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Waiver & Disclaimer — Molloy Madness",
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <div className="pt-32 pb-12 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              Legal
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800">
              Waiver & Disclaimer
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 md:p-10 space-y-8">
            {/* Tournament Waiver */}
            <section>
              <h2 className="text-xl font-extrabold text-slate-800 mb-4">
                Tournament Waiver & Release of Liability
              </h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  By registering for or participating in the Molloy Madness 3v3
                  Basketball Tournament (&quot;Event&quot;), held at Day Hill Dome, 875 Day
                  Hill Rd, Windsor, CT 06095, you acknowledge that you have read
                  and agree to the following waiver and release of liability.
                </p>
                <p>
                  All participants must be at least <strong className="text-slate-800">14 years of age</strong>.
                  Participants under 18 must have parental or legal guardian
                  consent prior to participation.
                </p>
              </div>
            </section>

            {/* Assumption of Risk */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Assumption of Risk
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                I am aware of the nature of, and possibility for injury with any
                sports activity, and I hereby assume responsibility for myself to
                participate. I understand that participation in this Event
                involves inherent risks, including but not limited to physical
                injury, and I voluntarily assume all such risks.
              </p>
            </section>

            {/* Release and Waiver */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Release & Waiver
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                I will not hold the Matthew C. Molloy Foundation, Day Hill Dome
                Partners, LLC (dba Day Hill Dome), and/or their officers,
                employees, volunteers, agents, or sponsors responsible in case of
                any accident or injury as a result of this participation. I
                hereby further agree to indemnify and hold harmless both parties
                from and against any and all loss, damage, claim, demand,
                liability, or expense by reason of any damage or injury to
                property or person which may be claimed to have arisen as a
                result of or in connection with participating in activities at
                the Event.
              </p>
            </section>

            {/* Medical Authorization */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Medical Authorization
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                I grant Day Hill Dome Partners, LLC, the Matthew C. Molloy
                Foundation, and their staff permission to utilize any medical
                emergency services deemed necessary to treat injuries that I may
                incur while participating. I understand that neither organization
                provides insurance for program participants.
              </p>
            </section>

            {/* Health Acknowledgement */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Health Acknowledgement
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                I agree, understand, and acknowledge, on my own behalf, that an
                inherent risk of exposure to COVID-19 and any other communicable
                or infectious disease exists in any public place where people are
                present.
              </p>
            </section>

            {/* Media Release */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Media Release
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                I grant permission to the Matthew C. Molloy Foundation and Day
                Hill Dome Partners, LLC to use photographs, video, or other media
                of my participation for promotional purposes.
              </p>
            </section>

            {/* Waiver Requirement */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
              <h3 className="text-sm font-bold text-amber-800 mb-2">
                Waiver Requirement
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                All participants are required to sign a waiver prior to game day.
                Waiver links are sent via email after registration. If you have
                not received your waiver, please contact us.
              </p>
            </section>

            {/* Contact */}
            <p className="text-sm text-slate-500 text-center pt-2">
              Questions? Contact{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-amber-600 font-semibold hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
