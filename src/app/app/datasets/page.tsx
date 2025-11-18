// src/app/app/datasets/page.tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MOCK_DATASETS = [
  {
    id: "1",
    name: "Main coffee shop",
    createdAt: "2025-01-10",
    rows: 12843,
  },
  {
    id: "2",
    name: "Online store",
    createdAt: "2025-02-03",
    rows: 8421,
  },
  {
    id: "3",
    name: "Pop-up events 2024",
    createdAt: "2024-11-21",
    rows: 2134,
  },
];

export default function DatasetsPage() {
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

      {/* Table */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Your datasets</p>
          <p className="text-xs text-slate-400">
            {MOCK_DATASETS.length} dataset
            {MOCK_DATASETS.length !== 1 ? "s" : ""} total
          </p>
        </div>

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
              {MOCK_DATASETS.map((dataset) => (
                <tr
                  key={dataset.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="py-2 align-middle">
                    <span className="font-medium">{dataset.name}</span>
                  </td>
                  <td className="py-2 align-middle">
                    <span className="text-slate-500">{dataset.createdAt}</span>
                  </td>
                  <td className="py-2 align-middle text-right">
                    {dataset.rows.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {MOCK_DATASETS.length === 0 && (
          <p className="mt-6 text-center text-xs text-slate-400">
            You don&apos;t have any datasets yet. Create one to start exploring
            your sales.
          </p>
        )}
      </Card>
    </div>
  );
}
