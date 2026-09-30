import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 px-8 py-16 max-w-3xl mx-auto">
      <Link
        to="/"
        className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-wider font-mono mb-8 block"
      >
        &larr; Return to Dashboard
      </Link>

      <h1 className="text-2xl font-bold tracking-wider mb-2">PRIVACY POLICY</h1>
      <p className="text-xs text-zinc-500 font-mono mb-8">
        astratwin.drdo.gov.in | Last Updated: September 2026
      </p>

      <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            1. DATA COLLECTION AND PROCESSING
          </h2>
          <p>
            This prototype uses synthetic engine telemetry generated in the browser.
            No operational aircraft data is collected or transmitted.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            2. DATA RETENTION
          </h2>
          <p>
            Simulation data remains in the current browser session. The dashboard
            does not retain operational records.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            3. SECURITY CLASSIFICATION
          </h2>
          <p>
            This demonstration is not a classified or operational DRDO system.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            4. THIRD-PARTY DATA SHARING
          </h2>
          <p>
            Simulated telemetry processing runs locally in this browser. No
            telemetry service or external model is connected.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            5. CONTACT
          </h2>
          <p>
            For queries regarding data handling, contact the DRDO Data
            Protection Officer through official DRDO communication channels.
          </p>
        </section>
      </div>
    </div>
  );
}
