// src/app/pricing/page.tsx
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/product" className="hover:text-slate-900">
              Product
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/auth/sign-in"
              className="text-slate-600 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white hover:bg-blue-500"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

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
          <button className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">
            Join the waitlist
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            No credit card required. We&apos;ll email you when plans are
            available.
          </p>
        </div>
      </section>
    </main>
  );
}
