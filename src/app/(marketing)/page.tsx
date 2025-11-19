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
            <a href="#product" className="hover:text-slate-900">
              Product
            </a>
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
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

      {/* HERO + “GRÁFICA” DEBAJO */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-24 md:pt-20">
        {/* Texto hero */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            A clear way to
            <br />
            understand your sales
            <br />
            and predict revenue.
          </h1>

          <p className="mt-5 max-w-xl text-sm text-slate-600 md:text-base">
            RevenueLens turns your raw sales exports into clean dashboards and
            simple forecasts, so you can see what&apos;s happening and
            what&apos;s coming next without needing a data team.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800"
            >
              Start analyzing sales
            </Link>
            <a
              href="#product"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              See how it works
            </a>
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

      {/* PRODUCT */}
      <section id="product" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold tracking-tight">
            How RevenueLens feels in use
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Instead of fighting a giant spreadsheet, you get a calm dashboard:
            upload a CSV, pick a dataset, and see your revenue and forecasts in
            a few seconds.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Columna izquierda: flujo de trabajo */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Workflow
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="mt-[2px] h-4 w-4 rounded-full bg-blue-600 text-[10px] font-semibold text-white flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Upload your sales CSV</p>
                    <p className="text-slate-500">
                      Columns like{" "}
                      <span className="font-mono text-[11px]">
                        date, amount, product, category
                      </span>{" "}
                      are enough to get started.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="mt-[2px] h-4 w-4 rounded-full bg-slate-900 text-[10px] font-semibold text-white flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Explore your dashboard</p>
                    <p className="text-slate-500">
                      See daily revenue, orders, average ticket and top products
                      for each dataset.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="mt-[2px] h-4 w-4 rounded-full bg-emerald-600 text-[10px] font-semibold text-white flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="font-medium">See the forecast</p>
                    <p className="text-slate-500">
                      Generate a simple, transparent forecast for the next weeks
                      based on your history.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                You stay in control of the data: just upload exports from your
                POS, Stripe or internal system.
              </div>
            </div>

            {/* Columna derecha: mini dashboard simulado */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-600">
                    Demo coffee shop
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Last 30 days · Sales overview
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                  Dataset: <span className="font-medium">Main store</span>
                </div>
              </div>

              {/* KPIs mini */}
              <div className="mt-3 grid gap-2 text-[11px] text-slate-700 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Revenue</p>
                  <p className="mt-1 text-sm font-semibold">$42,390</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Orders</p>
                  <p className="mt-1 text-sm font-semibold">1,246</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500">Avg ticket</p>
                  <p className="mt-1 text-sm font-semibold">$34.02</p>
                </div>
              </div>

              {/* Mini chart */}
              <div className="mt-3 h-28 rounded-lg border border-slate-200 bg-slate-50">
                <div className="h-full w-full p-2">
                  <svg
                    viewBox="0 0 200 80"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <polyline
                      points="0,55 25,52 50,50 75,44 100,40 125,36 150,30 175,28 200,24"
                      fill="none"
                      stroke="rgb(15,23,42)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="0,60 25,58 50,56 75,53 100,51 125,49 150,47 175,46 200,45"
                      fill="none"
                      stroke="rgb(148,163,184)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Mini tabla productos */}
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[10px] font-semibold text-slate-600">
                  Top products (demo)
                </p>
                <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>House Blend Coffee</span>
                    <span className="font-mono">$18,230</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cold Brew</span>
                    <span className="font-mono">$9,840</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Croissant</span>
                    <span className="font-mono">$6,120</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                The actual app uses the same layout: KPIs, daily revenue chart,
                and breakdowns by product and category.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl text-center mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight">
              Simple pricing, coming soon
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              RevenueLens is in early access. We&apos;re starting with a simple,
              transparent pricing model for small teams and growing companies.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold">Starter</h3>
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
              <h3 className="text-sm font-semibold">Pro</h3>
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
        </div>
      </section>
    </main>
  );
}
