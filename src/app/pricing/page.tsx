// src/app/pricing/page.tsx
import { Button } from "@/components/ui/button"; // Importar esto
import { MarketingHeader } from "@/components/layout/marketing-header";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl text-center mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight">
            Simple pricing, coming soon
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            RevenueLens is in early access. We&apos;re starting with a simple,
            transparent pricing model for small teams and growing companies.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold">Starter</h2>
            <p className="mt-1 text-xs text-slate-600">
              For solo founders and small businesses.
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-800">
              Coming soon
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li>• Upload CSVs for a few datasets</li>
              <li>• Core dashboards and basic forecasts</li>
              <li>• Email support</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold">Pro</h2>
            <p className="mt-1 text-xs text-slate-600">
              For teams managing multiple locations or clients.
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-800">
              Coming soon
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li>• More datasets and higher volumes</li>
              <li>• Advanced forecasting options</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-md px-6">
            Join the waitlist
          </Button>
          <p className="mt-2 text-[11px] text-slate-500">
            No credit card required. We&apos;ll email you when plans are
            available.
          </p>
        </div>
      </section>
    </main>
  );
}
