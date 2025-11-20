import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/layout/marketing-header";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl text-center mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Simple pricing, coming soon
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            RevenueLens is in early access.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Starter Plan */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold">Starter</h2>
            <p className="mt-4 text-2xl font-semibold text-slate-800">
              Free during Beta
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li>• Core dashboards</li>
              <li>• Unlimited datasets (early access)</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Pro</h2>
            <p className="mt-4 text-2xl font-semibold text-slate-800">
              Coming soon
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li>• Advanced forecasting</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>

        {/* BOTÓN ARREGLADO: Ahora lleva al registro */}
        <div className="mt-8 text-center">
          <Link href="/auth/sign-up">
            <Button variant="outline" className="px-6">
              Start for free
            </Button>
          </Link>
          <p className="mt-2 text-[11px] text-slate-500">
            No credit card required. Free while in early access.
          </p>
        </div>
      </section>
    </main>
  );
}
