// src/app/app/predictions/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const MOCK_DATASETS = [
  { id: "demo", name: "Demo dataset" },
  { id: "coffee-shop", name: "Main coffee shop" },
  { id: "online-store", name: "Online store" },
];

function generateMockHistory(days: number): HistoryPoint[] {
  const today = new Date();
  const base = 4200;
  const result: HistoryPoint[] = [];

  for (let i = days; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const noise = Math.sin(i / 3) * 160 + i * 8;
    const value = base + noise;

    result.push({
      date: d.toISOString().slice(0, 10),
      historical: Math.round(value),
    });
  }

  return result;
}

function generateMockForecast(h: Horizon): ForecastPoint[] {
  const today = new Date();
  const base = 4300;
  const result: ForecastPoint[] = [];

  for (let i = 1; i <= h; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const noise = Math.sin(i / 2) * 180 + i * 15;
    const value = base + noise;

    result.push({
      date: d.toISOString().slice(0, 10),
      forecast: Math.round(value),
    });
  }

  return result;
}

export default function PredictionsPage() {
  const [selectedDataset, setSelectedDataset] = useState<string>("demo");
  const [horizon, setHorizon] = useState<Horizon>(14);
  const [history] = useState<HistoryPoint[]>(() => generateMockHistory(30));
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  function handleGenerate() {
    setIsGenerating(true);
    // En el futuro aquí llamaremos a /api/predictions
    const data = generateMockForecast(horizon);
    setForecast(data);
    setIsGenerating(false);
  }

  const chartData = buildChartData(history, forecast);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Predictions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate revenue forecasts for your sales datasets.
        </p>
      </div>

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
              >
                {MOCK_DATASETS.map((dataset) => (
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

          <div>
            <Button onClick={handleGenerate} disabled={isGenerating}>
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
            Dataset:{" "}
            <span className="font-medium">
              {MOCK_DATASETS.find((d) => d.id === selectedDataset)?.name ?? "—"}
            </span>
          </p>
        </div>

        <div className="h-64">
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
