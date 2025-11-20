"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { FileDown, FileText, Loader2, UploadCloud } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { parseAndValidateCsv } from "@/lib/csvParser";
import { downloadCsv } from "@/lib/utils"; // AÑADIDO downloadCsv

export default function NewDatasetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // FUNCIÓN NUEVA: Descargar plantilla
  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = [["date", "amount", "product", "category"]];
    const exampleRow = [["2024-01-01", "150.50", "Coffee Blend", "Beverages"]];
    downloadCsv("template_revenuelens.csv", [...headers, ...exampleRow]);
  };

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

      const { data: dataset, error: dsError } = await supabase
        .from("datasets")
        .insert({ name: name.trim(), business_id: profile.business_id })
        .select()
        .single();

      if (dsError || !dataset)
        throw dsError || new Error("Failed to create dataset");
      datasetId = dataset.id;

      const salesToInsert = await parseAndValidateCsv(file, datasetId!);
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
      if (datasetId) {
        await supabase.from("datasets").delete().eq("id", datasetId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StaggerContainer className="space-y-4 max-w-lg mx-auto pt-4">
      <StaggerItem className="text-center mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          New Dataset
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Import CSV data to create a new sales source.
        </p>
      </StaggerItem>

      <StaggerItem>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dataset Name
              </label>
              <input
                type="text"
                required
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                placeholder="e.g. Q1 Sales 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                CSV File
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer relative group">
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
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-slate-700 block">
                      {file ? file.name : "Click to upload CSV"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Required columns: date, amount
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NUEVO BLOQUE DE AYUDA */}
            <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-600 font-medium">
                    Unknown format?
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your CSV must have at least <strong>date</strong> and{" "}
                    <strong>amount</strong> columns.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1"
                  >
                    <FileDown className="h-3 w-3" /> Download example template
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 border border-red-100 text-[11px] text-red-600 font-medium flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-medium h-9"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Upload & Process"
                )}
              </Button>
            </div>
          </form>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}
