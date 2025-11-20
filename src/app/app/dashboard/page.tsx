"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import {
  type DashboardSummary,
  processSalesData,
  type RangeOption,
} from "@/lib/analytics";
import { downloadCsv, formatCurrency } from "@/lib/utils";
import type { Dataset, Sale } from "@/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [range, setRange] = useState<RangeOption>("30");
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    async function initDashboard() {
      try {
        const { data: ds } = await supabase
          .from("datasets")
          .select("id, name, created_at, business_id")
          .order("created_at", { ascending: false });

        if (!isMounted) return;
        const list = (ds ?? []) as Dataset[];
        setDatasets(list);

        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedDatasetId(firstId);
          const { data: rawSales } = await supabase
            .from("sales")
            .select("date, amount, product, category")
            .eq("dataset_id", firstId);

          if (rawSales && isMounted) {
            const processed = processSalesData(rawSales as Sale[], "30");
            setDashboardData(processed);
          }
        }
      } catch (err) {
        if (isMounted) toast.error("Failed to load dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initDashboard();
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (loading || !selectedDatasetId) return;
    let isMounted = true;
    async function refreshData() {
      setIsSwitching(true);
      try {
        const { data: rawSales } = await supabase
          .from("sales")
          .select("date, amount, product, category")
          .eq("dataset_id", selectedDatasetId);

        if (isMounted && rawSales) {
          const processed = processSalesData(rawSales as Sale[], range);
          setDashboardData(processed);
        }
      } catch {
        toast.error("Could not update data");
      } finally {
        if (isMounted) setIsSwitching(false);
      }
    }
    refreshData();
    return () => {
      isMounted = false;
    };
  }, [selectedDatasetId, range]);

  const handleExportDaily = () => {
    if (!dashboardData?.chartData) return;
    const rows = [
      ["date", "revenue"],
      ...dashboardData.chartData.map((p) => [p.date, p.revenue.toString()]),
    ];
    downloadCsv("daily_revenue.csv", rows);
  };

  const handleExportProducts = () => {
    if (!dashboardData?.topProducts) return;
    const rows = [
      ["product", "revenue"],
      ...dashboardData.topProducts.map((p) => [
        p.product,
        p.revenue.toString(),
      ]),
    ];
    downloadCsv("top_products.csv", rows);
  };

  if (loading) return <DashboardSkeleton />;

  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center mt-4">
        <StaggerItem>
          <BarChart3 className="h-8 w-8 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No datasets</h3>
          <p className="mt-1 text-xs text-slate-500 mb-4">
            Upload your first CSV to start.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 text-white h-8"
          >
            Upload Data
          </Button>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No data available.
      </div>
    );
  }

  const { kpis, chartData, topProducts, categories } = dashboardData;
  const datasetName =
    datasets.find((d) => d.id === selectedDatasetId)?.name || "Dataset";

  // --- RENDER TÉCNICO (Opción A) ---
  return (
    <StaggerContainer
      className={`space-y-4 ${isSwitching ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      {/* HEADER: Inputs pequeños y técnicos */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
            {datasetName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 w-32 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/5 hover:border-slate-300 transition-colors"
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-slate-200" />
          <select
            className="h-8 w-32 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/5 hover:border-slate-300 transition-colors"
            value={range}
            onChange={(e) => setRange(e.target.value as RangeOption)}
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </StaggerItem>

      {/* KPIs GRID: Denso, fuente mono, sin sombras */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(kpis.totalRevenue),
            sub: null,
          },
          { label: "Orders", value: kpis.orders.toLocaleString(), sub: null },
          {
            label: "Avg. Ticket",
            value: formatCurrency(kpis.avgTicket),
            sub: null,
          },
          {
            label: "Top Product",
            value: kpis.topProduct || "—",
            sub: kpis.topProductShare
              ? `${(kpis.topProductShare * 100).toFixed(1)}%`
              : null,
          },
        ].map((stat, i) => (
          <StaggerItem key={i}>
            <div className="bg-white rounded-lg border border-slate-200 p-4 h-full flex flex-col justify-between transition-colors hover:border-slate-300">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {stat.label}
              </p>
              <div className="flex items-end gap-2 justify-between">
                <p
                  className={`text-lg font-semibold tracking-tight text-slate-900 ${i !== 3 ? "font-mono" : "truncate text-sm"}`}
                >
                  {stat.value}
                </p>
                {stat.sub && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm mb-0.5">
                    {stat.sub}
                  </span>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* BENTO GRID: Chart (2/3) + Top Products (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-[320px]">
        {/* CHART SECTION */}
        <StaggerItem className="lg:col-span-2">
          <div className="h-full rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Revenue Trend
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDaily}
                className="h-6 text-[10px] px-2 border-slate-200 hover:bg-slate-50"
              >
                Export CSV
              </Button>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      `$${Number(val).toLocaleString("en-US", { notation: "compact" })}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "4px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "none",
                      fontSize: "11px",
                      padding: "8px",
                    }}
                    formatter={(val: number) => [
                      formatCurrency(val),
                      "Revenue",
                    ]}
                    labelStyle={{
                      fontFamily: "monospace",
                      color: "#64748b",
                      marginBottom: "4px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f172a"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#0f172a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </StaggerItem>

        {/* TABLE: TOP PRODUCTS */}
        <StaggerItem className="lg:col-span-1">
          <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Top Products
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-[10px] text-slate-400 hover:text-slate-900"
                onClick={handleExportProducts}
              >
                Export
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-50">
                  {topProducts.slice(0, 7).map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td
                        className="px-4 py-2 text-slate-600 truncate max-w-[140px]"
                        title={p.product}
                      >
                        <span className="mr-2 text-[9px] text-slate-300 font-mono group-hover:text-slate-500">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        {p.product}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-12 text-center text-xs text-slate-400"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </StaggerItem>
      </div>

      {/* CATEGORIES BAR (Dense) */}
      <StaggerItem>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category Breakdown
            </h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-right font-medium">Revenue</th>
                  <th className="px-4 py-2 text-right font-medium w-1/3">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.slice(0, 5).map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-700">{c.category}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-900">
                      {formatCurrency(c.revenue)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800"
                            style={{
                              width: `${Math.min((c.revenue / kpis.totalRevenue) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 w-8 text-right">
                          {((c.revenue / kpis.totalRevenue) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}
