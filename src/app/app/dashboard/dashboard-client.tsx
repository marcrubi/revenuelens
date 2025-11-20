"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, Loader2 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { type DashboardSummary, type RangeOption } from "@/lib/analytics";
import { downloadCsv, formatCurrency } from "@/lib/utils";
import type { Dataset } from "@/types";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

interface DashboardClientProps {
  initialDatasets: Dataset[];
  initialData: DashboardSummary | null;
}

export default function DashboardClient({
  initialDatasets,
  initialData,
}: DashboardClientProps) {
  const router = useRouter();
  const datasets = initialDatasets;

  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    initialData,
  );

  // Aseguramos que si hay datasets, seleccionamos el primero
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    datasets.length > 0 ? datasets[0].id : "",
  );

  // IMPORTANTE: Por defecto en cliente usamos "all" para asegurar que se ve todo
  // si el server recortó a 90 días.
  const [range, setRange] = useState<RangeOption>("all");
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // Si es el montaje inicial y los datos coinciden, no recargamos
    const isInitialMount =
      initialDatasets.length > 0 &&
      selectedDatasetId === initialDatasets[0].id &&
      range === "all" && // Si cambiamos default a 'all', forzamos reload si server mandó '90'
      dashboardData === initialData;

    // Si el server mandó datos parciales (90 días) y aquí queremos 'all',
    // isInitialMount será false y entrará a buscar los datos completos.

    if (!selectedDatasetId) return;

    let isMounted = true;

    async function refreshData() {
      setIsSwitching(true);
      try {
        const endDate = new Date();
        const startDate = new Date();

        if (range === "30") startDate.setDate(endDate.getDate() - 30);
        if (range === "90") startDate.setDate(endDate.getDate() - 90);
        if (range === "all") startDate.setFullYear(2000); // Año 2000 asegura traer todo

        const startStr = startDate.toISOString().slice(0, 10);
        const endStr = endDate.toISOString().slice(0, 10);

        // LLAMADAS PARALELAS
        const [dailyRes, productsRes, summaryRes] = await Promise.all([
          // 1. Gráfica
          supabase
            .from("daily_metrics")
            .select("date, revenue")
            .eq("dataset_id", selectedDatasetId)
            .gte("date", startStr)
            .lte("date", endStr)
            .order("date", { ascending: true }),

          // 2. Top Products (RPC)
          supabase.rpc("get_top_products", {
            p_dataset_id: selectedDatasetId,
            p_start_date: startStr,
            p_end_date: endStr,
          }),

          // 3. Resumen KPIs (RPC)
          supabase.rpc("get_dashboard_summary", {
            p_dataset_id: selectedDatasetId,
            p_start_date: startStr,
            p_end_date: endStr,
          }),
        ]);

        if (isMounted) {
          // Procesar Gráfica
          const chartData = (dailyRes.data || []).map((d) => ({
            date: String(d.date),
            revenue: Number(d.revenue),
          }));

          // Procesar Productos
          const topProducts = (productsRes.data || []).map((p: any) => ({
            product: p.product,
            revenue: Number(p.revenue),
          }));

          // Procesar Resumen (KPIs)
          // Si summaryRes.data viene vacío (null array), ponemos defaults
          const summaryItem = (summaryRes.data && summaryRes.data[0]) || {};
          const totalRevenue = Number(summaryItem.total_revenue || 0);
          const totalOrders = Number(summaryItem.total_orders || 0);
          const avgTicket = Number(summaryItem.avg_ticket || 0);

          const topProduct = topProducts[0];

          setDashboardData({
            kpis: {
              totalRevenue,
              orders: totalOrders,
              avgTicket,
              topProduct: topProduct?.product || "—",
              topProductShare:
                topProduct && totalRevenue > 0
                  ? topProduct.revenue / totalRevenue
                  : 0,
            },
            chartData,
            topProducts,
            categories: [],
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Error updating dashboard data");
      } finally {
        if (isMounted) setIsSwitching(false);
      }
    }

    refreshData();
    return () => {
      isMounted = false;
    };
  }, [selectedDatasetId, range]); // Se ejecuta al cambiar dataset o rango

  // --- EXPORTS ---
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

  // --- RENDER ---
  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No datasets available"
        description="Upload your first sales CSV to generate the dashboard."
        className="mt-4"
        action={
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 text-white h-8"
          >
            Upload Data
          </Button>
        }
      />
    );
  }

  if (!dashboardData) return null; // O skeleton

  const { kpis, chartData, topProducts } = dashboardData;
  const datasetName =
    datasets.find((d) => d.id === selectedDatasetId)?.name || "Dataset";

  return (
    <StaggerContainer className="space-y-4">
      {/* HEADER */}
      <StaggerItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            Overview
            {isSwitching && (
              <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
            )}
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

      {/* CONTENIDO PRINCIPAL */}
      <div
        className={`transition-opacity duration-200 ${isSwitching ? "opacity-60 pointer-events-none" : "opacity-100"}`}
      >
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: "Total Revenue",
              value: formatCurrency(kpis.totalRevenue),
            },
            { label: "Orders", value: kpis.orders.toLocaleString() },
            { label: "Avg. Ticket", value: formatCurrency(kpis.avgTicket) },
            {
              label: "Top Product",
              value: kpis.topProduct || "—",
              sub: kpis.topProductShare
                ? `${(kpis.topProductShare * 100).toFixed(1)}%`
                : null,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between min-h-[80px]"
            >
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
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                    {stat.sub}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CHART + TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-[320px]">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Revenue Trend
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDaily}
                className="h-6 text-[10px] px-2 border-slate-200"
              >
                Export CSV
              </Button>
            </div>
            <div className="h-[250px] w-full">
              {chartData.length > 0 ? (
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
                      minTickGap={30}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                        fontFamily: "monospace",
                      }}
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
                        fontSize: "11px",
                      }}
                      formatter={(val: number) => [
                        formatCurrency(val),
                        "Revenue",
                      ]}
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
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  No data in this range
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Top Products
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-[10px] text-slate-400"
                onClick={handleExportProducts}
              >
                Export
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-50">
                  {topProducts.length > 0 ? (
                    topProducts.slice(0, 7).map((p, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td
                          className="px-4 py-2 text-slate-600 truncate max-w-[140px]"
                          title={p.product}
                        >
                          <span className="mr-2 text-[9px] text-slate-300 font-mono">
                            {(i + 1).toString().padStart(2, "0")}
                          </span>
                          {p.product}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-medium text-slate-900">
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-8 text-center text-slate-400 italic"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </StaggerContainer>
  );
}
