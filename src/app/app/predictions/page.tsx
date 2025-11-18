// src/app/app/predictions/page.tsx
"use client";

import { useEffect, useState } from "react";
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

type Horizon = 7 | 14 | 30;

type Dataset = {
  id: string;
  name: string;
};

type HistoryPoint = {
  date: string;
  historical: number;
};

type ForecastPoint = {
  date: string;
  forecast: number;
};

type ChartPoint = {
  date: string;
  historical?: number;
  forecast?: number;
};

export default function PredictionsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [horizon, setHorizon] = useState<Horizon>(14);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData?.user) {
          if (!isMounted) return;
          setError("You need to be signed in to view predictions.");
          setLoadingDatasets(false);
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
          setLoadingDatasets(false);
          return;
        }

        const { data: ds, error: dsError } = await supabase
          .from("datasets")
          .select("id, name")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (dsError) {
          setError("We couldn't load your datasets.");
          setLoadingDatasets(false);
          return;
        }

        setDatasets(ds ?? []);
        if ((ds ?? []).length > 0) {
          setSelectedDataset(ds[0].id);
        }
        setLoadingDatasets(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading datasets.");
        setLoadingDatasets(false);
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, []);

  function buildChartData(
    historyPoints: HistoryPoint[],
    forecastPoints: ForecastPoint[],
  ): ChartPoint[] {
    const map: Record<string, ChartPoint> = {};

    for (const point of historyPoints) {
      map[point.date] = {
        date: point.date,
        historical: point.historical,
      };
    }

    for (const point of forecastPoints) {
      if (!map[point.date]) {
        map[point.date] = { date: point.date };
      }
      map[point.date].forecast = point.forecast;
    }

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }

  function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function generateMovingAverageForecast(
    historyPoints: HistoryPoint[],
    h: Horizon,
    windowSize = 7,
  ): ForecastPoint[] {
    if (historyPoints.length === 0) return [];

    const sorted = [...historyPoints].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const values = sorted.map((p) => p.historical);

    const lastDate = sorted[sorted.length - 1].date;
    const result: ForecastPoint[] = [];

    for (let i = 1; i <= h; i++) {
      const startIdx = Math.max(0, values.length - windowSize);
      const window = values.slice(startIdx);
      const avg = window.reduce((sum, v) => sum + v, 0) / (window.length || 1);

      const date = addDays(lastDate, i);
      const value = Math.round(avg);

      result.push({ date, forecast: value });
      values.push(value);
    }

    return result;
  }

  async function handleGenerate() {
    setError(null);
    setForecast([]);

    if (!selectedDataset) {
      setError("Select a dataset to generate a forecast.");
      return;
    }

    setIsGenerating(true);
    try {
      // 1) Obtener todas las ventas del dataset (histórico completo)
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("date, amount")
        .eq("dataset_id", selectedDataset)
        .order("date", { ascending: true });

      if (salesError) {
        setError("We couldn't load sales data for this dataset.");
        setIsGenerating(false);
        return;
      }

      if (!sales || sales.length === 0) {
        setError(
          "There is no sales data for this dataset yet. Upload a CSV first.",
        );
        setIsGenerating(false);
        return;
      }

      // 2) Agregar por día (revenue diario)
      const revenueByDate = new Map<string, number>();
      for (const s of sales) {
        const date = s.date.slice(0, 10);
        const amount = Number(s.amount);
        if (!Number.isFinite(amount)) continue;
        revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + amount);
      }

      const dates = Array.from(revenueByDate.keys()).sort((a, b) =>
        a.localeCompare(b),
      );

      const historyPoints: HistoryPoint[] = dates.map((d) => ({
        date: d,
        historical: revenueByDate.get(d) ?? 0,
      }));

      setHistory(historyPoints);

      // 3) Forecast por moving average
      const forecastPoints = generateMovingAverageForecast(
        historyPoints,
        horizon,
        7,
      );

      setForecast(forecastPoints);
      setIsGenerating(false);
    } catch {
      setError("Unexpected error while generating the forecast.");
      setIsGenerating(false);
    }
  }
  const chartData = buildChartData(history, forecast);
  const selectedDatasetName =
    datasets.find((d) => d.id === selectedDataset)?.name ?? "—";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Predictions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate revenue forecasts for your sales datasets.
        </p>
      </div>
      php-template Copy code
      {/* CONTROLS */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Dataset */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-600">
                Dataset
              </label>
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                disabled={loadingDatasets || datasets.length === 0}
              >
                {loadingDatasets && <option value="">Loading datasets…</option>}
                {!loadingDatasets && datasets.length === 0 && (
                  <option value="">No datasets found</option>
                )}
                {!loadingDatasets &&
                  datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Horizon */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-slate-600">
                Horizon
              </label>
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value) as Horizon)}
              >
                <option value={7}>Next 7 days</option>
                <option value={14}>Next 14 days</option>
                <option value={30}>Next 30 days</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {error && (
              <p className="max-w-xs text-right text-xs text-red-600">
                {error}
              </p>
            )}
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                loadingDatasets ||
                datasets.length === 0 ||
                !selectedDataset
              }
            >
              {isGenerating ? "Generating…" : "Generate forecast"}
            </Button>
          </div>
        </div>
      </Card>
      {/* CHART */}
      <Card className="p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Historical & forecast
            </p>
            <p className="text-[11px] text-slate-400">
              Historical series (solid) and forecast (dashed) for the selected
              dataset.
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Dataset: <span className="font-medium">{selectedDatasetName}</span>
          </p>
        </div>

        <div className="h-64">
          {history.length === 0 && forecast.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Run a forecast to see the historical series and prediction.
            </div>
          ) : (
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="historical"
                  name="Historical"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      {/* TABLE */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Forecast table</p>
          <p className="text-xs text-slate-400">
            {forecast.length > 0
              ? `${forecast.length} days forecasted`
              : "Run a forecast to see the results"}
          </p>
        </div>

        {forecast.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            No forecast generated yet. Choose a dataset and horizon, then click{" "}
            <span className="font-medium">Generate forecast</span>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-right font-medium">
                    Predicted revenue
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {forecast.map((point) => (
                  <tr
                    key={point.date}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-2 align-middle">{point.date}</td>
                    <td className="py-2 text-right align-middle">
                      ${point.forecast.toLocaleString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
