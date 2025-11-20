"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3 } from "lucide-react";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
// Imports nuevos y refactorizados
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { type DashboardSummary, processSalesData, type RangeOption } from "@/lib/analytics";
import { downloadCsv, formatCurrency } from "@/lib/utils";
import type { Dataset, Sale } from "@/types"; // Recharts
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  // Estados
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [range, setRange] = useState<RangeOption>("30");

  // Datos procesados
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null,
  );

  // 1. Carga Inicial
  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      try {
        // Carga inicial de datasets
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

          // Cargar datos del primer dataset
          const { data: rawSales } = await supabase
            .from("sales")
            .select("date, amount, product, category")
            .eq("dataset_id", firstId); // NOTA: Idealmente paginar o filtrar por fecha en servidor si es muy grande

          if (rawSales && isMounted) {
            // Procesar en el cliente usando la lib analytics
            // Cast a Sale[] implícito
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

  // 2. Cambio de Dataset o Rango
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
  }, [selectedDatasetId, range]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Handlers de Exportación ---
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

  const handleExportCategories = () => {
    if (!dashboardData?.categories) return;
    const rows = [
      ["category", "revenue"],
      ...dashboardData.categories.map((c) => [
        c.category,
        c.revenue.toString(),
      ]),
    ];
    downloadCsv("categories.csv", rows);
  };

  // --- RENDER ---

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center mt-8">
        <StaggerItem>
          <div className="flex h-12 w-12 mx-auto items-center justify-center bg-white shadow-sm border border-slate-100 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Your dashboard is empty
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Upload your first sales dataset to get started.
          </p>
          <Button onClick={() => router.push("/app/datasets/new")}>
            Upload Sales Data
          </Button>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Si hay datasets pero falló el procesado o no hay ventas
  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">
          No sales data found for this selection.
        </p>
      </div>
    );
  }

  const { kpis, chartData, topProducts, categories } = dashboardData;
  const datasetName =
    datasets.find((d) => d.id === selectedDatasetId)?.name || "Dataset";

  return (
    <StaggerContainer
      className={`space-y-6 transition-opacity duration-200 ${
        isSwitching ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Header & Controls */}
      <StaggerItem>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
            <p className="text-sm text-slate-500">
              Performance for{" "}
              <span className="font-medium text-slate-900">{datasetName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
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
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeOption)}
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </StaggerItem>

      {/* KPIs Grid */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4">
        <StaggerItem>
          <HoverCard className="p-5 shadow-sm border-slate-200">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Revenue
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalRevenue)}
            </p>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="p-5 shadow-sm border-slate-200">
            <p className="text-xs font-medium uppercase text-slate-500">
              Orders
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {kpis.orders.toLocaleString()}
            </p>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="p-5 shadow-sm border-slate-200">
            <p className="text-xs font-medium uppercase text-slate-500">
              Avg. Ticket
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.avgTicket)}
            </p>
          </HoverCard>
        </StaggerItem>
        <StaggerItem>
          <HoverCard className="p-5 shadow-sm border-slate-200">
            <p className="text-xs font-medium uppercase text-slate-500">
              Top Product
            </p>
            <div className="mt-2">
              <p
                className="truncate text-sm font-semibold text-slate-900"
                title={kpis.topProduct || ""}
              >
                {kpis.topProduct || "—"}
              </p>
              <p className="text-xs text-slate-500">
                {kpis.topProductShare
                  ? `${(kpis.topProductShare * 100).toFixed(1)}% share`
                  : "No data"}
              </p>
            </div>
          </HoverCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Chart */}
      <StaggerItem>
        <HoverCard className="p-6 shadow-sm border-slate-200">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Revenue Trend</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportDaily}
              disabled={!chartData.length}
            >
              Export CSV
            </Button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) =>
                    `$${Number(val).toLocaleString("en-US", { notation: "compact" })}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HoverCard>
      </StaggerItem>

      {/* Bottom Tables */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2">
        {/* Table: Top Products */}
        <StaggerItem>
          <HoverCard className="shadow-sm border-slate-200 overflow-hidden p-0 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 text-sm">
                Top Products
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 text-xs"
                onClick={handleExportProducts}
              >
                Export
              </Button>
            </div>
            <div className="flex-1 overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  {topProducts.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td
                        className="px-6 py-3 text-slate-700 truncate max-w-[200px]"
                        title={p.product}
                      >
                        {p.product}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-8 text-center text-xs text-slate-400"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </HoverCard>
        </StaggerItem>

        {/* Table: Categories */}
        <StaggerItem>
          <HoverCard className="shadow-sm border-slate-200 overflow-hidden p-0 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 text-sm">
                Categories
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 text-xs"
                onClick={handleExportCategories}
              >
                Export
              </Button>
            </div>
            <div className="flex-1 overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  {categories.map((c, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td
                        className="px-6 py-3 text-slate-700 truncate max-w-[200px]"
                        title={c.category}
                      >
                        {c.category}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(c.revenue)}
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-8 text-center text-xs text-slate-400"
                      >
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </HoverCard>
        </StaggerItem>
      </StaggerContainer>
    </StaggerContainer>
  );
}
