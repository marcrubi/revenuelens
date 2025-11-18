// src/app/app/dashboard/page.tsx
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sales overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          See how your revenue is trending across your datasets.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Total revenue</p>
          <p className="mt-2 text-xl font-semibold">$128,430</p>
          <p className="mt-1 text-xs text-emerald-600">
            +12.4% vs last 30 days
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Orders</p>
          <p className="mt-2 text-xl font-semibold">3,284</p>
          <p className="mt-1 text-xs text-slate-500">Avg ticket $39.10</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Top product</p>
          <p className="mt-2 text-sm font-semibold">House Blend Coffee</p>
          <p className="mt-1 text-xs text-slate-500">24% of total revenue</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Forecast</p>
          <p className="mt-2 text-xl font-semibold">$132,900</p>
          <p className="mt-1 text-xs text-slate-500">Next 30 days</p>
        </Card>
      </div>

      {/* Aquí luego meteremos el chart principal + tablas */}
      <Card className="h-64 p-4">
        <p className="text-xs font-medium text-slate-500 mb-2">
          Daily revenue (demo)
        </p>
        <div className="flex h-full items-center justify-center text-xs text-slate-400">
          Chart placeholder – here we will mount Recharts
        </div>
      </Card>
    </div>
  );
}
