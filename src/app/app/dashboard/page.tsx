// src/app/app/dashboard/page.tsx
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sales overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          See how your revenue is trending across your datasets.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Dataset
          </label>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm"
            defaultValue="demo"
          >
            <option value="demo">Demo dataset</option>
            <option value="store-a">Store A</option>
            <option value="store-b">Store B</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600 mb-1">
            Date range
          </label>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm"
            defaultValue="30"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom</option>
          </select>
        </div>
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
          <p className="text-xs font-medium text-slate-500">Number of orders</p>
          <p className="mt-2 text-xl font-semibold">3,284</p>
          <p className="mt-1 text-xs text-slate-500">Avg ticket $39.10</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">
            Average ticket size
          </p>
          <p className="mt-2 text-xl font-semibold">$39.10</p>
          <p className="mt-1 text-xs text-slate-500">Company-wide</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Top product</p>
          <p className="mt-2 text-sm font-semibold">House Blend Coffee</p>
          <p className="mt-1 text-xs text-slate-500">24% of total revenue</p>
        </Card>
      </div>

      {/* MAIN CHART */}
      <Card className="p-4">
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500">
            Daily revenue (demo)
          </p>
          <p className="text-[11px] text-slate-400">
            Historical daily revenue for the selected dataset
          </p>
        </div>

        {/* Placeholder más visual */}
        <div className="flex h-64 items-center justify-center">
          <div className="w-full h-full bg-[repeating-linear-gradient(90deg,_#e5e7eb_0,_#e5e7eb_1px,_transparent_1px,_transparent_40px)] opacity-60 rounded-md flex items-center justify-center text-xs text-slate-400">
            Chart placeholder – Recharts will be mounted here
          </div>
        </div>
      </Card>

      {/* LOWER TABLES */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* TOP PRODUCTS */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Top products</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="py-1 text-left">Product</th>
                <th className="py-1 text-right">Orders</th>
                <th className="py-1 text-right">Revenue</th>
                <th className="py-1 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-1">House Blend Coffee</td>
                <td className="py-1 text-right">912</td>
                <td className="py-1 text-right">$35,420</td>
                <td className="py-1 text-right">24%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">Espresso</td>
                <td className="py-1 text-right">653</td>
                <td className="py-1 text-right">$22,910</td>
                <td className="py-1 text-right">16%</td>
              </tr>
              <tr>
                <td className="py-1">Cold Brew</td>
                <td className="py-1 text-right">488</td>
                <td className="py-1 text-right">$18,314</td>
                <td className="py-1 text-right">12%</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* SALES BY CATEGORY */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Sales by category</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="py-1 text-left">Category</th>
                <th className="py-1 text-right">Revenue</th>
                <th className="py-1 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-1">Beverages</td>
                <td className="py-1 text-right">$68,200</td>
                <td className="py-1 text-right">53%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">Snacks</td>
                <td className="py-1 text-right">$32,900</td>
                <td className="py-1 text-right">26%</td>
              </tr>
              <tr>
                <td className="py-1">Other</td>
                <td className="py-1 text-right">$18,100</td>
                <td className="py-1 text-right">14%</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
