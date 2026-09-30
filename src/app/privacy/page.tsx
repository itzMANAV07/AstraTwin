import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 px-8 py-16 max-w-3xl mx-auto">
      <Link
        href="/"
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
            AstraTwin processes engine telemetry data transmitted from MALE UAV
            aero-piston engine monitoring systems. All telemetry is processed
            through edge-compute nodes with asymmetric compression before
            transmission. Raw sensor data is retained on-device and only
            aggregated health scores and anomaly vectors are transmitted to
            ground stations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            2. DATA RETENTION
          </h2>
          <p>
            Processed health indices and maintenance advisories are retained for
            the operational lifecycle of each engine unit plus five years for
            fleet reliability analytics. Raw telemetry buffers on edge devices
            are overwritten on a rolling 72-hour basis unless flagged by an
            anomaly event.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            3. SECURITY CLASSIFICATION
          </h2>
          <p>
            All data processed by AstraTwin is classified under DRDO security
            protocols. Access is restricted to authorized maintenance personnel,
            flight operations officers, and designated engineering staff with
            appropriate clearance levels.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-200 mb-2 tracking-wide">
            4. THIRD-PARTY DATA SHARING
          </h2>
          <p>
            No engine telemetry, health scores, or maintenance data is shared
            with external third parties. All processing occurs within
            DRDO-controlled infrastructure. Edge-AI inference models operate
            entirely on-device without external network dependencies.
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
