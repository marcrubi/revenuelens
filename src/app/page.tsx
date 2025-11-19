// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* TOPBAR */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>

          {/* Nav centro (desktop) */}
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/product" className="hover:text-slate-900">
              Product
            </Link>
            <Link href="/pricing" className="hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          {/* Auth derecha */}
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

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-24 md:pt-20">
        {/* Texto hero */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            Turn your sales data
            <br />
            into clear, actionable
            <br />
            revenue forecasts.
          </h1>

          <p className="mt-5 max-w-xl text-sm text-slate-600 md:text-base">
            Upload a simple CSV and get dashboards, breakdowns and forecasts
            that make your next month&apos;s revenue less of a guess and more of
            a plan.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800"
            >
              Get started for free
            </Link>
            <Link
              href="/product"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              View product
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            No integrations required. Export from your POS or Stripe and upload
            a CSV.
          </p>
        </div>

        {/* Gráfica demo debajo del título */}
        <div className="mt-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Last 30 days · Demo workspace</span>
              <span>Revenue · Orders · Avg ticket</span>
            </div>

            <div className="relative h-32 rounded-lg bg-slate-50">
              <div className="absolute inset-4 rounded-md border border-slate-200 bg-white">
                {/* líneas horizontales */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1/4 border-b border-slate-100 last:border-b-0"
                  />
                ))}
                {/* línea “trend” */}
                <div className="pointer-events-none absolute inset-2">
                  <svg
                    viewBox="0 0 200 80"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <polyline
                      points="0,60 30,55 60,50 90,40 120,35 150,25 180,30 200,20"
                      fill="none"
                      stroke="rgb(37,99,235)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-xs text-slate-700 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Revenue</p>
                <p className="mt-1 text-sm font-semibold">$128,430</p>
                <p className="mt-1 text-[11px] text-emerald-600">
                  +12.4% vs last 30 days
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Orders</p>
                <p className="mt-1 text-sm font-semibold">3,284</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Avg ticket $39.10
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Forecast</p>
                <p className="mt-1 text-sm font-semibold">$132,900</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  30-day ahead estimate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MADE FOR */}
      <section id="made-for" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
            Made for teams that live in spreadsheets and exports.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            RevenueLens is for people who already track their numbers but are
            tired of rebuilding the same charts in Excel every month.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">Owners & managers</h3>
              <p className="mt-2 text-xs text-slate-600">
                Restaurant groups, ecommerce stores, SaaS founders and any
                operator who wants a clear, weekly view of revenue.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">Ops & finance</h3>
              <p className="mt-2 text-xs text-slate-600">
                People who live between operations and finance, and need to
                answer “how are we doing this month?” without building a deck.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">Agencies & consultants</h3>
              <p className="mt-2 text-xs text-slate-600">
                Partners managing multiple clients who want a simple way to
                share revenue dashboards without custom builds each time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} RevenueLens. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-slate-800 hover:underline">
              Privacy
            </button>
            <button className="hover:text-slate-800 hover:underline">
              Terms
            </button>
            <button className="hover:text-slate-800 hover:underline">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
