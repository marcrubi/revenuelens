// src/app/app/datasets/new/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  HoverCard,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-wrappers";
// Importamos la nueva lógica
import { parseAndValidateCsv } from "@/lib/csvParser";

export default function NewDatasetPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a dataset name.");
      return;
    }
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setSubmitting(true);
    let datasetId: string | null = null;

    try {
      // 1. Auth Check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (!profile?.business_id) throw new Error("No workspace found");

      // 2. Crear Dataset (Metadatos)
      const { data: dataset, error: dsError } = await supabase
        .from("datasets")
        .insert({ name: name.trim(), business_id: profile.business_id })
        .select()
        .single();

      if (dsError || !dataset)
        throw dsError || new Error("Failed to create dataset");

      datasetId = dataset.id;

      // 3. Parsing y Validación (Lógica extraída)
      const salesToInsert = await parseAndValidateCsv(file, datasetId!);

      // ... resto del código
      // 4. Insertar en Lotes (Batch)
      const BATCH_SIZE = 500;
      for (let i = 0; i < salesToInsert.length; i += BATCH_SIZE) {
        const batch = salesToInsert.slice(i, i + BATCH_SIZE);
        const { error: batchError } = await supabase
          .from("sales")
          .insert(batch);
        if (batchError) throw batchError;
      }

      toast.success("Dataset uploaded successfully!");
      router.push("/app/datasets");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");

      // Rollback manual si falló el proceso después de crear el dataset
      if (datasetId) {
        await supabase.from("datasets").delete().eq("id", datasetId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // El render (return) se mantiene EXACTAMENTE IGUAL que antes
  return (
    <StaggerContainer className="space-y-6 max-w-xl mx-auto">
      <StaggerItem>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Dataset
        </h1>
        <p className="text-sm text-slate-500">
          Upload a CSV file to import your sales history.
        </p>
      </StaggerItem>

      <StaggerItem>
        <HoverCard className="p-8 shadow-sm border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Dataset Name
              </label>
              <input
                type="text"
                required
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400"
                placeholder="e.g. Q1 Sales 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                CSV File
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError(null);
                  }}
                />
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="h-8 w-8 text-slate-300" />
                  <span className="text-sm">
                    {file ? file.name : "Click to browse or drag file here"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Max 5MB. Required: date, amount.
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Upload & Process"
                )}
              </Button>
            </div>
          </form>
        </HoverCard>
      </StaggerItem>
    </StaggerContainer>
  );
}
