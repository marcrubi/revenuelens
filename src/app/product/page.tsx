// src/app/product/page.tsx
import Link from "next/link";

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-slate-50">
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
            <Link href="/pricing" className="hover:text-slate-900">
              Pricing
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

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            A calm dashboard for your sales, forecasts and product breakdowns.
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            RevenueLens turns your sales CSVs into dashboards with daily
            revenue, average ticket and product-level insights. No BI tools, no
            warehouse required.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            How it works
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-600">
                1. Upload your sales CSV
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Export from your POS, Stripe or internal system. Columns like{" "}
                <span className="font-mono text-[11px]">
                  date, amount, product, category
                </span>{" "}
                are enough to get started.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-600">
                2. Explore your dashboard
              </p>
              <p className="mt-2 text-xs text-slate-600">
                See total revenue, number of orders, average ticket size and top
                products for each dataset, over the date range you care about.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-600">
                3. See the forecast
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Generate a simple, transparent forecast for the next weeks based
                on your historical daily revenue. No black-box magic.
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW + MINI DASHBOARD */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {/* Workflow */}
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
                  <p className="font-medium">Create a dataset per source</p>
                  <p className="text-slate-500">
                    One dataset per store, client or channel. Switch between
                    them in the dashboard to compare performance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-4 w-4 rounded-full bg-slate-900 text-[10px] font-semibold text-white flex items-center justify-center">
                  2
                </span>
                <div>
                  <p className="font-medium">Slice by date range</p>
                  <p className="text-slate-500">
                    Focus on the last 30 days, last quarter or your own custom
                    range to see how revenue is trending.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-4 w-4 rounded-full bg-emerald-600 text-[10px] font-semibold text-white flex items-center justify-center">
                  3
                </span>
                <div>
                  <p className="font-medium">Look at products and categories</p>
                  <p className="text-slate-500">
                    Spot which products drive most of your revenue and which
                    categories are lagging behind.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
              Multi-tenant by design: each workspace can have multiple datasets,
              and all access is scoped per business.
            </div>
          </div>

          {/* Mini dashboard */}
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
              The internal app uses the same layout: KPIs, daily revenue chart,
              and breakdowns by product and category, per dataset.
            </p>
          </div>
        </section>

        {/* FUTURE / AI */}
        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Future / AI forecasts
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Our forecasting engine starts simple, using transparent baselines
            based on your historical sales. As we evolve, we&apos;ll plug in
            more advanced models—but always with a clear explanation of why the
            forecast looks the way it does. No bullshit, no black boxes.
          </p>
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Built on Next.js, Supabase and a simple forecasting layer you can
            trust.
          </div>
          <Link
            href="/auth/sign-up"
            className="rounded-full bg-slate-900 px-5 py-2 text-xs font-medium text-slate-50 hover:bg-slate-800"
          >
            Create your account
          </Link>
        </section>
      </section>
    </main>
  );
}
