"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// CORRECCIÓN 1: Añadimos Loader2 aquí
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import type { Dataset } from "@/types";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { generateForecast, type PredictionPoint } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";

interface PredictionsClientProps {
  initialDatasets: Dataset[];
  initialPoints: PredictionPoint[];
  initialDatasetId: string;
}

export default function PredictionsClient({
  initialDatasets,
  initialPoints,
  initialDatasetId,
}: PredictionsClientProps) {
  const router = useRouter();

  const datasets = initialDatasets;

  const [selectedDatasetId, setSelectedDatasetId] =
    useState<string>(initialDatasetId);
  const [points, setPoints] = useState<PredictionPoint[]>(initialPoints);

  const [horizon, setHorizon] = useState<number>(14);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!selectedDatasetId) return;
    setIsGenerating(true);
    try {
      const { data: dailySales } = await supabase
        .from("daily_metrics")
        .select("date, revenue")
        .eq("dataset_id", selectedDatasetId)
        .order("date", { ascending: true })
        .limit(365);

      if (!dailySales || dailySales.length < 7) {
        toast.warning("Not enough historical data (min 7 days)");
        setPoints([]);
        return;
      }

      // CORRECCIÓN 2: Tipamos 'd' para eliminar el error de ESLint
      const historicalPoints = dailySales.map(
        (d: { date: string | number; revenue: number }) => ({
          date: String(d.date),
          revenue: Number(d.revenue),
        }),
      );

      const forecast = generateForecast(historicalPoints, horizon);
      setPoints(forecast);
      toast.success(`Forecast generated`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  }

  // --- RENDER UI (Exactamente igual) ---

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Data Available"
        description="Upload sales data to start forecasting revenue."
        className="mt-6 max-w-2xl"
        action={
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 h-8"
          >
            Upload Data
          </Button>
        }
      />
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {/* ... Header ... */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Predictions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Project future revenue based on history.
            </p>
          </div>

          <div className="flex items-end gap-3 bg-white p-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">
                Dataset
              </label>
              <select
                className="h-8 w-40 rounded-md border border-slate-200 px-2 text-xs bg-white outline-none focus:ring-2 focus:ring-slate-100"
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">
                Horizon
              </label>
              <select
                className="h-8 w-24 rounded-md border border-slate-200 px-2 text-xs bg-white outline-none focus:ring-2 focus:ring-slate-100"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
              className="rounded-md bg-blue-600 hover:bg-blue-700 h-8 text-xs font-medium px-4 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3 w-3" /> Forecast
                </>
              )}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-3 h-[500px]">
        {/* Left: Chart (2 cols) */}
        <StaggerItem className="md:col-span-2 h-full">
          <div className="h-full bg-white rounded-lg border border-slate-200 p-4 flex flex-col">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">
              Visualization
            </h3>
            <div className="flex-1 w-full min-h-0">
              {points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={points}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                        fontFamily: "monospace",
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                        fontFamily: "monospace",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        `$${Number(val).toLocaleString("en-US", { notation: "compact" })}`
                      }
                    />
                    <Tooltip
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "none",
                        fontSize: "11px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200">
                  <TrendingUp className="h-6 w-6 mb-2 opacity-50" />
                  <p className="text-xs">
                    Select options and generate forecast
                  </p>
                </div>
              )}
            </div>
          </div>
        </StaggerItem>

        {/* Right: Data Table (1 col) */}
        <StaggerItem className="h-full">
          <div className="h-full bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-xs font-bold uppercase text-slate-500">
                Forecast Data
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-0">
              {points.some((p) => p.type === "forecast") ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 font-medium text-slate-500 border-b border-slate-200">
                        Date
                      </th>
                      <th className="px-4 py-2 font-medium text-slate-500 text-right border-b border-slate-200">
                        Proj. Rev
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {points
                      .filter((p) => p.type === "forecast")
                      .map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-600 font-mono">
                            {p.date}
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-medium text-emerald-600">
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 p-4">
                  No data generated
                </div>
              )}
            </div>
          </div>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
