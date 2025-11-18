// src/app/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Sale = {
  date: string;
  amount: number;
  product: string | null;
  category: string | null;
};

type Kpis = {
  totalRevenue: number;
  orders: number;
  avgTicket: number;
  topProduct: string | null;
  topProductShare: number | null;
};

type ChartPoint = {
  date: string;
  revenue: number;
};

type ProductRow = {
  product: string;
  revenue: number;
};

type CategoryRow = {
  category: string;
  revenue: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [topProducts, setTopProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [datasetName, setDatasetName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        // 1) Usuario
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData?.user) {
          if (!isMounted) return;
          router.replace("/auth/sign-in");
          return;
        }

        const userId = authData.user.id;

        // 2) Profile -> business_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", userId)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError || !profile?.business_id) {
          setError(
            "We couldn't find a workspace linked to your account. Try creating a dataset first.",
          );
          setLoading(false);
          return;
        }

        const businessId = profile.business_id;

        // 3) Datasets del negocio
        const { data: datasets, error: datasetsError } = await supabase
          .from("datasets")
          .select("id, name, created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (datasetsError) {
          setError("We couldn't load your datasets.");
          setLoading(false);
          return;
        }

        if (!datasets || datasets.length === 0) {
          setError(
            "You don't have any datasets yet. Create one to see your dashboard.",
          );
          setLoading(false);
          return;
        }

        const activeDataset = datasets[0];
        setDatasetName(activeDataset.name);

        // 4) Ventas últimos 30 días de ese dataset
        const today = new Date();
        const from = new Date();
        from.setDate(today.getDate() - 29); // 30 días incluyendo hoy

        const fromStr = from.toISOString().slice(0, 10);

        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("date, amount, product, category")
          .eq("dataset_id", activeDataset.id)
          .gte("date", fromStr);

        if (!isMounted) return;

        if (salesError) {
          setError("We couldn't load your sales data.");
          setLoading(false);
          return;
        }

        const castedSales: Sale[] = (sales ?? []).map((s) => ({
          date: s.date,
          amount: Number(s.amount),
          product: s.product ?? null,
          category: s.category ?? null,
        }));

        if (castedSales.length === 0) {
          setError(
            "We didn't find any sales for the last 30 days. Upload data to see the dashboard.",
          );
          setLoading(false);
          return;
        }

        // 5) KPIs
        const totalRevenue = castedSales.reduce(
          (sum, s) => sum + (Number.isFinite(s.amount) ? s.amount : 0),
          0,
        );
        const orders = castedSales.length;
        const avgTicket = orders > 0 ? totalRevenue / orders : 0;

        // Top product por revenue
        const revenueByProduct = new Map<string, number>();
        for (const s of castedSales) {
          const key = s.product?.trim() || "Unspecified";
          revenueByProduct.set(
            key,
            (revenueByProduct.get(key) ?? 0) + s.amount,
          );
        }

        let topProduct: string | null = null;
        let topProductRevenue = 0;

        for (const [product, revenue] of revenueByProduct.entries()) {
          if (revenue > topProductRevenue) {
            topProductRevenue = revenue;
            topProduct = product;
          }
        }

        const topProductShare =
          totalRevenue > 0 ? topProductRevenue / totalRevenue : null;

        setKpis({
          totalRevenue,
          orders,
          avgTicket,
          topProduct,
          topProductShare,
        });

        // 6) Gráfico: revenue diario
        const revenueByDate = new Map<string, number>();
        for (const s of castedSales) {
          const d = s.date.slice(0, 10);
          revenueByDate.set(d, (revenueByDate.get(d) ?? 0) + s.amount);
        }

        const dates = Array.from(revenueByDate.keys()).sort((a, b) =>
          a.localeCompare(b),
        );

        const chartPoints: ChartPoint[] = dates.map((d) => ({
          date: d,
          revenue: revenueByDate.get(d) ?? 0,
        }));

        setChartData(chartPoints);

        // 7) Tablas: top productos y categorías
        const productRows: ProductRow[] = Array.from(revenueByProduct.entries())
          .map(([product, revenue]) => ({
            product,
            revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const revenueByCategory = new Map<string, number>();
        for (const s of castedSales) {
          const key = s.category?.trim() || "Unspecified";
          revenueByCategory.set(
            key,
            (revenueByCategory.get(key) ?? 0) + s.amount,
          );
        }

        const categoryRows: CategoryRow[] = Array.from(
          revenueByCategory.entries(),
        )
          .map(([category, revenue]) => ({
            category,
            revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(productRows);
        setCategories(categoryRows);

        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading the dashboard.");
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your sales overview…</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Sales overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            See how your revenue is trending across your datasets.
          </p>
        </div>
        <Card className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  const { totalRevenue, orders, avgTicket, topProduct, topProductShare } = kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sales overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last 30 days for{" "}
          <span className="font-medium">
            {datasetName ?? "your latest dataset"}
          </span>
          .
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Total revenue</p>
          <p className="mt-2 text-xl font-semibold">
            $
            {totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Orders</p>
          <p className="mt-2 text-xl font-semibold">
            {orders.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Avg ticket $
            {avgTicket.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Top product</p>
          <p className="mt-2 text-sm font-semibold">
            {topProduct ?? "No product data"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {topProduct && topProductShare !== null
              ? `${(topProductShare * 100).toFixed(1)}% of total revenue`
              : "Based on product column"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">
            Revenue (last 30 days)
          </p>
          <p className="mt-2 text-xl font-semibold">
            $
            {totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-500">Based on uploaded sales</p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="h-64 p-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Daily revenue</p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickMargin={6}
              stroke="#94a3b8"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickMargin={6}
              stroke="#94a3b8"
              tickFormatter={(value) =>
                `$${(value as number).toLocaleString("en-US")}`
              }
            />
            <Tooltip
              formatter={(value) =>
                `$${(value as number).toLocaleString("en-US")}`
              }
              labelStyle={{ fontSize: 11 }}
              contentStyle={{ fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm font-semibold">Top products</p>
          <p className="mb-3 mt-1 text-xs text-slate-500">
            Based on revenue in the last 30 days.
          </p>
          {topProducts.length === 0 ? (
            <p className="py-4 text-xs text-slate-400">
              No product information available.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1 text-left font-medium">Product</th>
                  <th className="py-1 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((row) => (
                  <tr
                    key={row.product}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-1">
                      {row.product === "Unspecified"
                        ? "Unspecified"
                        : row.product}
                    </td>
                    <td className="py-1 text-right">
                      $
                      {row.revenue.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold">Sales by category</p>
          <p className="mb-3 mt-1 text-xs text-slate-500">
            Based on the category column in your CSV.
          </p>
          {categories.length === 0 ? (
            <p className="py-4 text-xs text-slate-400">
              No category information available.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1 text-left font-medium">Category</th>
                  <th className="py-1 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-1">
                      {row.category === "Unspecified"
                        ? "Unspecified"
                        : row.category}
                    </td>
                    <td className="py-1 text-right">
                      $
                      {row.revenue.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
