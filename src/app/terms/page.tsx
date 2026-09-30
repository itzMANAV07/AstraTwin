import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 px-8 py-16 max-w-3xl mx-auto">
      <Link
        to="/"
        className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-mono mb-8 block"
      >
        &larr; Return to Dashboard
      </Link>

      <h1 className="text-2xl font-bold tracking-wider mb-2">
        TERMS AND CONDITIONS
      </h1>
      <p className="text-xs text-zinc-500 font-mono mb-8">
        astratwin.drdo.gov.in | Last Updated: September 2026
      </p>

      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            1. AUTHORIZED USE
          </h2>
          <p>
            AstraTwin here is a synthetic demonstration for SIH26054. It is not
            an operational aircraft monitoring system.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            2. SYSTEM LIMITATIONS
          </h2>
          <p>
            All outputs are estimates generated from prototype assumptions.
            They are not engineering guidance and must not be used for flight
            or maintenance decisions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            3. LIABILITY
          </h2>
          <p>
            DRDO and the AstraTwin development team provide this system on an
            as-is basis for predictive analysis support. Maintenance decisions
            based on system outputs are the responsibility of the certifying
            maintenance authority. The system is a decision-support tool, not an
            autonomous maintenance authority.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            4. INTELLECTUAL PROPERTY
          </h2>
          <p>
            All algorithms, models, and interface designs within AstraTwin are
            the intellectual property of DRDO. Reproduction, reverse
            engineering, or distribution without written authorization is
            prohibited under applicable intellectual property and defense
            procurement regulations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            5. MODIFICATIONS
          </h2>
          <p>
            DRDO reserves the right to modify these terms at any time. Users
            will be notified of changes through official DRDO communication
            channels. Continued use of the system constitutes acceptance of
            modified terms.
          </p>
        </section>
      </div>
    </div>
  );
}
