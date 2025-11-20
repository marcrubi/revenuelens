"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Sparkles, TrendingUp } from "lucide-react";
import type { Dataset } from "@/types";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { DashboardSkeleton } from "@/components/ui/skeletons";
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
          .select("id, name")
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
      const { data: sales } = await supabase
        .from("sales")
        .select("date, amount")
        .eq("dataset_id", selectedDatasetId)
        .order("date", { ascending: true });
      if (!sales || sales.length < 7) {
        toast.warning("Not enough historical data (min 7 days)");
        return;
      }

      const aggMap = new Map<string, number>();
      sales.forEach((s) => {
        const d = s.date.slice(0, 10);
        aggMap.set(d, (aggMap.get(d) || 0) + Number(s.amount));
      });
      const historicalPoints = Array.from(aggMap.entries()).map(
        ([date, revenue]) => ({ date, revenue }),
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

  if (loading) return <DashboardSkeleton />;

  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50 mt-6 max-w-2xl mx-auto">
        <StaggerItem>
          <TrendingUp className="h-8 w-8 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">
            No Data Available
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Upload sales data to start forecasting.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 h-8"
          >
            Upload Data
          </Button>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {/* Header + Controls Row */}
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
                "Calculating..."
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
