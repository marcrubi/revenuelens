// src/app/page.tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarketingHeader } from "@/components/layout/marketing-header";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MarketingHeader />
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
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Start analyzing sales
            </Link>
            <a
              href="#product"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
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
    </main>
  );
}
