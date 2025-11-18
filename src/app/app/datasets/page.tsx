// src/app/app/datasets/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type Dataset = {
  id: string;
  name: string;
  created_at: string | null;
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      try {
        setError(null);

        const { data, error } = await supabase
          .from("datasets")
          .select("id, name, created_at")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (error) {
          setError(error.message);
          setDatasets([]);
          setLoading(false);
          return;
        }

        const datasetsData = data ?? [];
        setDatasets(datasetsData);

        // Contar filas en sales por dataset
        const counts: Record<string, number> = {};

        await Promise.all(
          datasetsData.map(async (dataset) => {
            const { count, error: countError } = await supabase
              .from("sales")
              .select("id", { count: "exact", head: true })
              .eq("dataset_id", dataset.id);

            if (!countError && typeof count === "number") {
              counts[dataset.id] = count;
            }
          }),
        );

        if (!isMounted) return;

        setRowCounts(counts);
        setLoading(false);
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
  }, []);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Datasets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the sales datasets that power your dashboards and forecasts.
          </p>
        </div>

        <Button asChild>
          <Link href="/app/datasets/new">New dataset</Link>
        </Button>
      </div>

      {/* Table / states */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Your datasets</p>
          {!loading && !error && (
            <p className="text-xs text-slate-400">
              {datasets.length} dataset
              {datasets.length !== 1 ? "s" : ""} total
            </p>
          )}
        </div>

        {loading ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Loading datasets…
          </p>
        ) : error ? (
          <p className="py-6 text-center text-xs text-red-600">
            We couldn&apos;t load your datasets: {error}
          </p>
        ) : datasets.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            You don&apos;t have any datasets yet. Create one to start exploring
            your sales.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Created at</th>
                  <th className="py-2 text-right font-medium">Rows</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {datasets.map((dataset) => {
                  const rows =
                    rowCounts[dataset.id] !== undefined
                      ? rowCounts[dataset.id]
                      : 0;

                  return (
                    <tr
                      key={dataset.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="py-2 align-middle">
                        <span className="font-medium">{dataset.name}</span>
                      </td>
                      <td className="py-2 align-middle">
                        <span className="text-slate-500">
                          {formatDate(dataset.created_at)}
                        </span>
                      </td>
                      <td className="py-2 text-right align-middle">
                        {rows.toLocaleString("en-US")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
