// src/app/app/datasets/new/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onabort = () => reject(new Error("File reading was aborted."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file);
  });
}

type ParsedRow = {
  date: string;
  amount: number;
  product: string | null;
  category: string | null;
  customer_id: string | null;
};

// Parser de una línea de CSV con comillas dobles y comas dentro de campos
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Escapado "" -> añade una comilla
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((c) => c.trim());
}

// Parser de CSV completo usando parseCsvLine
function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  const idxDate = header.indexOf("date");
  const idxAmount = header.indexOf("amount");
  const idxProduct = header.indexOf("product");
  const idxCategory = header.indexOf("category");
  const idxCustomerId =
    header.indexOf("customerid") !== -1
      ? header.indexOf("customerid")
      : header.indexOf("customer_id");

  if (idxDate === -1 || idxAmount === -1) {
    return [];
  }

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw) continue;

    const cols = parseCsvLine(raw);
    const date = cols[idxDate] ?? "";
    const amountRaw = cols[idxAmount] ?? "";

    if (!date || !amountRaw) continue;

    // Aceptar formatos tipo "1,200.50"
    const normalizedAmount = amountRaw.replace(/,/g, "");
    const amount = Number(normalizedAmount);
    if (!Number.isFinite(amount)) continue;

    const product = idxProduct !== -1 ? cols[idxProduct] || null : null;
    const category = idxCategory !== -1 ? cols[idxCategory] || null : null;
    const customer_id =
      idxCustomerId !== -1 ? cols[idxCustomerId] || null : null;

    rows.push({
      date,
      amount,
      product,
      category,
      customer_id,
    });
  }

  return rows;
}

export default function NewDatasetPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setSubmitting(true);

    let datasetId: string | null = null;

    try {
      // 1) Usuario actual
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setError("You need to be signed in to create a dataset.");
        return;
      }

      const userId = authData.user.id;

      // 2) Profile -> business_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError(
          "We couldn't load your profile. Please try again or contact support.",
        );
        return;
      }

      if (!profile?.business_id) {
        setError(
          "Your profile is not linked to a business yet. Please contact support or try again later.",
        );
        return;
      }

      // 3) Leer y parsear CSV ANTES de crear el dataset
      const text = await readFileAsText(file);
      const parsed = parseCsv(text);

      if (parsed.length === 0) {
        setError(
          "We couldn't find valid rows in the CSV. Make sure it has at least 'date' and 'amount' columns.",
        );
        return;
      }

      // 4) Crear dataset
      const { data: dataset, error: insertError } = await supabase
        .from("datasets")
        .insert({
          name: name.trim(),
          business_id: profile.business_id,
        })
        .select("id")
        .single();

      if (insertError || !dataset) {
        setError(insertError?.message ?? "Failed to create dataset.");
        return;
      }

      datasetId = dataset.id;

      // 5) Insertar ventas
      const salesToInsert = parsed.map((row) => ({
        dataset_id: datasetId,
        date: row.date,
        amount: row.amount,
        product: row.product,
        category: row.category,
        customer_id: row.customer_id,
      }));

      const { error: salesError } = await supabase
        .from("sales")
        .insert(salesToInsert);

      if (salesError) {
        // Intentar limpiar el dataset creado si la import falla
        await supabase.from("datasets").delete().eq("id", datasetId);

        setError(
          "We created the dataset but failed to import the sales data. The dataset was removed. Please fix the CSV and try again.",
        );
        return;
      }

      setSuccess("Dataset created and sales imported successfully.");
      router.push("/app/datasets");
    } catch {
      setError("Unexpected error while creating dataset.");
    } finally {
      setSubmitting(false);
    }
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
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
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
              {submitting ? "Creating dataset…" : "Upload & process"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
