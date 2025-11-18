// src/app/app/datasets/new/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewDatasetPage() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Please enter a dataset name.");
      return;
    }

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("The file must be a .csv file.");
      return;
    }

    // MVP: de momento no subimos nada a Supabase.
    // Más adelante aquí llamaremos a la API / Supabase.
    setSubmitting(true);

    // Simulación rápida de procesamiento local
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(
        "Dataset validated locally. In the next step we will connect this to Supabase.",
      );
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New dataset</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a CSV with your sales data to power dashboards and forecasts.
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Dataset name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Dataset name
            </label>
            <input
              type="text"
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5"
              placeholder="e.g. Main coffee shop 2024"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Choose a name that makes it easy to recognize this dataset later.
            </p>
          </div>

          {/* CSV upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              CSV file
            </label>
            <input
              type="file"
              accept=".csv"
              className="block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-slate-800"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setFile(selectedFile);
                setError(null);
                setSuccess(null);
              }}
            />
            <p className="text-[11px] text-slate-500">
              Required columns: <span className="font-medium">date</span>,{" "}
              <span className="font-medium">amount</span>. Optional:{" "}
              <span className="font-medium">product</span>,{" "}
              <span className="font-medium">category</span>,{" "}
              <span className="font-medium">customerId</span>.
            </p>
          </div>

          {/* Messages */}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          {/* Actions */}
          <div className="pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Validating…" : "Upload & process"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
