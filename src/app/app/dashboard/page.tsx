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

type Dataset = {
  id: string;
  name: string;
};

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

type RangeOption = "30" | "90" | "all";

function filterSalesByRange(sales: Sale[], range: RangeOption): Sale[] {
  if (sales.length === 0) return [];

  if (range === "all") {
    return [...sales];
  }

  const sortedDates = sales.map((s) => s.date).sort();
  const maxDate = sortedDates[sortedDates.length - 1];

  const max = new Date(maxDate);
  const minRange = new Date(max);
  const days = range === "30" ? 29 : 89;
  minRange.setDate(max.getDate() - days);

  const minStr = minRange.toISOString().slice(0, 10);
  const filtered = sales.filter((s) => s.date >= minStr);

  if (filtered.length === 0) {
    return [...sales];
  }

  return filtered;
}

function downloadCsv(filename: string, rows: string[][]) {
  if (rows.length === 0) return;

  const escapeCell = (value: string) => {
    const v = value.replace(/"/g, '""');
    return /[",\n]/.test(v) ? `"${v}"` : v;
  };

  const csv = rows
    .map((row) => row.map((cell) => escapeCell(cell)).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [range, setRange] = useState<RangeOption>("30");

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [topProducts, setTopProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1) Cargar datasets del workspace
  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      try {
        setError(null);
        setLoading(true);

        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (!isMounted) return;

        if (authError || !authData?.user) {
          router.replace("/auth/sign-in");
          return;
        }
        const userId = authData.user.id;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", userId)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError || !profile?.business_id) {
          setError(
            "We couldn't find a workspace linked to your account. Create a dataset first.",
          );
          setDatasets([]);
          setLoading(false);
          return;
        }

        const businessId = profile.business_id;

        const { data: ds, error: dsError } = await supabase
          .from("datasets")
          .select("id, name")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (dsError) {
          setError("We couldn't load your datasets.");
          setDatasets([]);
          setLoading(false);
          return;
        }

        const list = (ds ?? []) as Dataset[];
        setDatasets(list);

        if (list.length === 0) {
          setError("You don't have any datasets yet. Upload one first.");
          setLoading(false);
          return;
        }

        // Dataset por defecto: el más reciente
        setSelectedDatasetId((current) => current || list[0].id);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading datasets.");
        setDatasets([]);
        setLoading(false);
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2) Cargar ventas + calcular KPIs / chart / tablas cuando cambian dataset o rango
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardForDataset() {
      if (!selectedDatasetId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("date, amount, product, category")
          .eq("dataset_id", selectedDatasetId)
          .order("date", { ascending: true });

        if (!isMounted) return;

        if (salesError) {
          setError("We couldn't load your sales data.");
          setLoading(false);
          return;
        }

        if (!sales || sales.length === 0) {
          setError(
            "This dataset has no sales yet. Upload data to see the dashboard.",
          );
          setKpis(null);
          setChartData([]);
          setTopProducts([]);
          setCategories([]);
          setLoading(false);
          return;
        }

        const castedSales: Sale[] = sales.map((s) => ({
          date: s.date,
          amount: Number(s.amount),
          product: s.product ?? null,
          category: s.category ?? null,
        }));

        const windowSales = filterSalesByRange(castedSales, range);

        // KPIs
        const totalRevenue = windowSales.reduce((sum, s) => sum + s.amount, 0);
        const orders = windowSales.length;
        const avgTicket = orders > 0 ? totalRevenue / orders : 0;

        const revenueByProduct = new Map<string, number>();
        for (const s of windowSales) {
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

        // Chart: revenue diario
        const revenueByDate = new Map<string, number>();
        for (const s of windowSales) {
          const d = s.date.slice(0, 10);
          revenueByDate.set(d, (revenueByDate.get(d) ?? 0) + s.amount);
        }

        const chartPoints: ChartPoint[] = Array.from(revenueByDate.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setChartData(chartPoints);

        // Top products
        const productRows: ProductRow[] = Array.from(revenueByProduct.entries())
          .map(([product, revenue]) => ({ product, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(productRows);

        // Categories
        const revenueByCategory = new Map<string, number>();
        for (const s of windowSales) {
          const key = s.category?.trim() || "Unspecified";
          revenueByCategory.set(
            key,
            (revenueByCategory.get(key) ?? 0) + s.amount,
          );
        }

        const categoryRows: CategoryRow[] = Array.from(
          revenueByCategory.entries(),
        )
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setCategories(categoryRows);

        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading dashboard.");
        setLoading(false);
      }
    }

    loadDashboardForDataset();

    return () => {
      isMounted = false;
    };
  }, [selectedDatasetId, range]);

  const selectedDatasetName =
    datasets.find((d) => d.id === selectedDatasetId)?.name ?? "—";

  const rangeLabel =
    range === "30"
      ? "Last 30 days (relative)"
      : range === "90"
        ? "Last 90 days (relative)"
        : "All available data";

  const handleExportDailyRevenue = () => {
    if (!chartData.length) return;
    const rows: string[][] = [["date", "revenue"]];
    chartData.forEach((p) => {
      rows.push([p.date, p.revenue.toString()]);
    });
    downloadCsv("daily_revenue.csv", rows);
  };

  const handleExportTopProducts = () => {
    if (!topProducts.length) return;
    const rows: string[][] = [["product", "revenue"]];
    topProducts.forEach((p) => {
      rows.push([p.product, p.revenue.toString()]);
    });
    downloadCsv("top_products.csv", rows);
  };

  const handleExportCategories = () => {
    if (!categories.length) return;
    const rows: string[][] = [["category", "revenue"]];
    categories.forEach((c) => {
      rows.push([c.category, c.revenue.toString()]);
    });
    downloadCsv("sales_by_category.csv", rows);
  };

  if (loading && !kpis && !error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your sales overview…</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Sales overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See how your revenue is trending across your datasets.
            </p>
          </div>

          {/* Controles deshabilitados si hay error */}
          <div className="flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center">
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
              disabled
            >
              <option>Dataset</option>
            </select>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
              disabled
            >
              <option>Range</option>
            </select>
          </div>
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
      {/* HEADER + CONTROLES */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Sales overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {rangeLabel} for{" "}
            <span className="font-medium">{selectedDatasetName}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs text-slate-600 md:flex-row md:items-center">
          <div className="flex flex-col gap-1 md:flex-row md:items-center">
            <span className="md:mr-1">Dataset</span>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              disabled={datasets.length === 0 || loading}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 md:flex-row md:items-center">
            <span className="md:mr-1">Range</span>
            <select
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeOption)}
              disabled={loading}
            >
              <option value="30">Last 30 days (relative)</option>
              <option value="90">Last 90 days (relative)</option>
              <option value="all">All data</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Total revenue</p>
          <p className="mt-2 text-xl font-semibold">
            $
            {totalRevenue.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
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
            {topProductShare !== null
              ? `${(topProductShare * 100).toFixed(1)}% of revenue`
              : "—"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500">Dataset range</p>
          <p className="mt-2 text-sm font-semibold">
            {range === "all" ? "All data" : rangeLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Relative to the most recent date in this dataset.
          </p>
        </Card>
      </div>

      {/* CHART + EXPORT */}
      <Card className="h-72 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Daily revenue</p>
            <p className="text-[11px] text-slate-400">
              Historical revenue aggregated by day.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportDailyRevenue}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
            disabled={!chartData.length}
          >
            Export CSV
          </button>
        </div>

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

      {/* TABLES + EXPORT */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top products */}
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Top products</p>
              <p className="text-xs text-slate-500">
                Based on revenue in the selected range.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportTopProducts}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
              disabled={!topProducts.length}
            >
              Export CSV
            </button>
          </div>

          {topProducts.length === 0 ? (
            <p className="py-4 text-xs text-slate-400">
              No product information.
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

        {/* Categories */}
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Sales by category</p>
              <p className="text-xs text-slate-500">
                Based on the category column in your CSV.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCategories}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
              disabled={!categories.length}
            >
              Export CSV
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="py-4 text-xs text-slate-400">No category data.</p>
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
