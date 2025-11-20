"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Sparkles, TrendingUp } from "lucide-react";
import type { Dataset } from "@/types";
import {
  HoverCard,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-wrappers";
import { DashboardSkeleton } from "@/components/ui/skeletons"; // Reusamos el esqueleto del dashboard
import { generateForecast, type PredictionPoint } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function PredictionsPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [horizon, setHorizon] = useState<number>(14);

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [points, setPoints] = useState<PredictionPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadDatasets() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          router.replace("/auth/sign-in");
          return;
        }

        const { data: ds } = await supabase
          .from("datasets")
          .select("id, name, created_at, business_id")
          .order("created_at", { ascending: false });

        if (isMounted) {
          const list = (ds as Dataset[]) || [];
          setDatasets(list);
          if (list.length > 0) setSelectedDatasetId(list[0].id);
        }
      } catch {
        toast.error("Error loading datasets");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDatasets();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleGenerate() {
    if (!selectedDatasetId) return;
    setIsGenerating(true);
    try {
      // 1. Traemos datos históricos
      const { data: sales } = await supabase
        .from("sales")
        .select("date, amount")
        .eq("dataset_id", selectedDatasetId)
        .order("date", { ascending: true });

      if (!sales || sales.length < 7) {
        toast.warning("Not enough historical data (min 7 days)");
        return;
      }

      // 2. Agregamos por día (por si hay múltiples ventas el mismo día)
      const aggMap = new Map<string, number>();
      sales.forEach((s) => {
        const d = s.date.slice(0, 10);
        aggMap.set(d, (aggMap.get(d) || 0) + Number(s.amount));
      });

      const historicalPoints = Array.from(aggMap.entries()).map(
        ([date, revenue]) => ({
          date,
          revenue,
        }),
      );

      // 3. Generamos predicción con la utilidad centralizada
      const forecast = generateForecast(historicalPoints, horizon);
      setPoints(forecast);
      toast.success(`Forecast generated for next ${horizon} days`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate prediction");
    } finally {
      setIsGenerating(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 mt-6">
        <StaggerItem>
          <TrendingUp className="h-10 w-10 mx-auto text-slate-400 mb-2" />
          <h3 className="font-semibold text-slate-900">No Data Available</h3>
          <p className="text-sm text-slate-500 mb-4">
            Upload sales data to start forecasting.
          </p>
          <Button onClick={() => router.push("/app/datasets/new")}>
            Upload Data
          </Button>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <h1 className="text-2xl font-bold text-slate-900">Predictions</h1>
        <p className="text-sm text-slate-500">
          Project future revenue based on historical trends.
        </p>
      </StaggerItem>

      {/* Controles */}
      <StaggerItem>
        <HoverCard className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Dataset
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200"
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
            <div className="w-full sm:w-40 space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Horizon
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200"
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
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 px-6"
            >
              {isGenerating ? (
                "Calculating..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Forecast
                </>
              )}
            </Button>
          </div>
        </HoverCard>
      </StaggerItem>

      {/* Gráfico y Tabla */}
      <StaggerContainer className="grid gap-6 md:grid-cols-3">
        {/* Gráfico Principal */}
        <StaggerItem className="md:col-span-2 h-[450px]">
          <HoverCard className="p-6 flex flex-col h-full shadow-sm border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Visualization</h3>
            {points.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      `$${Number(val).toLocaleString("en-US", { notation: "compact" })}`
                    }
                  />
                  <Tooltip
                    formatter={(val: number) => formatCurrency(val)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Click generate to see the forecast</p>
              </div>
            )}
          </HoverCard>
        </StaggerItem>

        {/* Tabla de Datos */}
        <StaggerItem className="h-[450px]">
          <HoverCard className="flex flex-col h-full p-0 overflow-hidden shadow-sm border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 text-sm">
                Forecast Data
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-0">
              {points.some((p) => p.type === "forecast") ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium text-slate-500">
                        Date
                      </th>
                      <th className="px-4 py-2 font-medium text-slate-500 text-right">
                        Proj. Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {points
                      .filter((p) => p.type === "forecast")
                      .map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 text-slate-700">
                            {p.date}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-emerald-600">
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                  Generated data will appear here
                </div>
              )}
            </div>
          </HoverCard>
        </StaggerItem>
      </StaggerContainer>
    </StaggerContainer>
  );
}
