// src/app/app/predictions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import {
  CartesianGrid,
  Legend,
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

type Horizon = 7 | 14 | 30;

type DailyPoint = {
  date: string;
  revenue: number;
  type: "history" | "forecast";
};

export default function PredictionsPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [horizon, setHorizon] = useState<Horizon>(14);

  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  const [points, setPoints] = useState<DailyPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1) Cargar datasets del negocio (multi-tenant)
  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      setLoadingDatasets(true);
      setError(null);

      try {
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

        if (profileError) {
          setError("We couldn't load your workspace profile.");
          setLoadingDatasets(false);
          setWorkspaceLoading(false);
          return;
        }

        if (!profile?.business_id) {
          setWorkspaceLoading(true);
          setLoadingDatasets(false);
          return;
        }

        setWorkspaceLoading(false);

        const { data: ds, error: dsError } = await supabase
          .from("datasets")
          .select("id, name")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (dsError) {
          setError("We couldn't load your datasets for predictions.");
          setLoadingDatasets(false);
          return;
        }

        const list = (ds ?? []) as Dataset[];
        setDatasets(list);

        if (list.length > 0) {
          setSelectedDatasetId((current) => current || list[0].id);
        }

        setLoadingDatasets(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading datasets.");
        setLoadingDatasets(false);
        setWorkspaceLoading(false);
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Helper: genera forecast simple (moving average)
  function buildForecast(
    historical: { date: string; revenue: number }[],
    horizon: Horizon,
  ): DailyPoint[] {
    if (historical.length === 0) return [];

    // Asegurar orden
    const sorted = [...historical].sort((a, b) => a.date.localeCompare(b.date));

    const windowSize = Math.min(7, sorted.length);
    const historyPoints: DailyPoint[] = sorted.map((p) => ({
      date: p.date,
      revenue: p.revenue,
      type: "history",
    }));

    const result: DailyPoint[] = [...historyPoints];

    const lastDate = new Date(sorted[sorted.length - 1].date);
    const rolling = [...sorted]; // copia mutable

    for (let i = 1; i <= horizon; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(lastDate.getDate() + i);

      const maSlice = rolling.slice(-windowSize);
      const avg =
        maSlice.reduce((sum, p) => sum + p.revenue, 0) / maSlice.length;

      const isoDate = forecastDate.toISOString().slice(0, 10);

      const forecastPoint: DailyPoint = {
        date: isoDate,
        revenue: avg,
        type: "forecast",
      };

      result.push(forecastPoint);
      rolling.push({ date: isoDate, revenue: avg });
    }

    return result;
  }

  async function handleGenerate() {
    if (!selectedDatasetId) return;

    setError(null);
    setLoadingForecast(true);
    setPoints([]);

    try {
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("date, amount")
        .eq("dataset_id", selectedDatasetId)
        .order("date", { ascending: true });

      if (salesError) {
        setError("We couldn't load sales for this dataset.");
        setLoadingForecast(false);
        return;
      }

      if (!sales || sales.length === 0) {
        setError("This dataset has no sales yet to generate a forecast.");
        setLoadingForecast(false);
        return;
      }

      const aggregated = new Map<string, number>();
      for (const s of sales) {
        const d = (s.date as string).slice(0, 10);
        const amt = Number(s.amount);
        if (!Number.isFinite(amt)) continue;
        aggregated.set(d, (aggregated.get(d) ?? 0) + amt);
      }

      const historical = Array.from(aggregated.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const allPoints = buildForecast(historical, horizon);
      setPoints(allPoints);
      setLoadingForecast(false);
    } catch {
      setError("Unexpected error while generating forecast.");
      setLoadingForecast(false);
    }
  }

  const selectedDatasetName =
    datasets.find((d) => d.id === selectedDatasetId)?.name ?? "—";

  const hasForecast = points.some((p) => p.type === "forecast");

  const historyOnly = points.filter((p) => p.type === "history");
  const forecastOnly = points.filter((p) => p.type === "forecast");

  const combinedForChart = points;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Predictions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate a simple forecast based on your historical daily revenue.
          </p>
        </div>
      </div>

      {/* Controles dataset + horizonte */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-col gap-1 text-xs text-slate-600">
              <span>Dataset</span>
              <select
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                disabled={loadingDatasets || !datasets.length}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                {!datasets.length && (
                  <option value="">No datasets available</option>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <span>Forecast horizon</span>
              <select
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value) as Horizon)}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={
              loadingDatasets ||
              loadingForecast ||
              !selectedDatasetId ||
              workspaceLoading
            }
            className="rounded-full"
          >
            {loadingForecast ? "Generating…" : "Generate forecast"}
          </Button>
        </div>

        {workspaceLoading && !error && (
          <p className="mt-3 text-xs text-slate-500">
            Setting up your workspace… Please wait a moment and try again.
          </p>
        )}

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </Card>

      {/* Chart + tabla */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 p-4 h-72">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Daily revenue & forecast
              </p>
              <p className="text-[11px] text-slate-400">
                Historical revenue in solid line, forecast in dashed line.
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p className="font-medium">{selectedDatasetName}</p>
              <p>
                Horizon: <span className="font-medium">{horizon} days</span>
              </p>
            </div>
          </div>

          {combinedForChart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No data yet. Select a dataset and generate a forecast.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedForChart}
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name="Revenue"
                  // Solo mostramos la línea sólida para histórico;
                  // el forecast se distingue por tipo en el dataset
                  // pero Recharts no permite fácil multi-serie con un solo key,
                  // así que interpretamos el segmento visual completo.
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tabla forecast */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Forecast table</p>
          <p className="mb-3 mt-1 text-xs text-slate-500">
            Historical values are shown for context. Forecasted days are
            labeled.
          </p>

          {points.length === 0 ? (
            <p className="py-4 text-xs text-slate-400">
              No forecast generated yet.
            </p>
          ) : (
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1 text-left font-medium">Date</th>
                    <th className="py-1 text-right font-medium">Revenue</th>
                    <th className="py-1 text-right font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr
                      key={`${p.date}-${p.type}`}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="py-1">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="py-1 text-right">
                        $
                        {p.revenue.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="py-1 text-right text-[11px] text-slate-500">
                        {p.type === "history" ? "History" : "Forecast"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasForecast && (
            <p className="mt-2 text-[11px] text-slate-500">
              This is a simple moving average baseline, not a full ML model yet.
              It&apos;s meant to give you a quick sense of where revenue might
              land.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
