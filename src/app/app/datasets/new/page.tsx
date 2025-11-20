"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, FileText, Loader2, UploadCloud } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { downloadCsv } from "@/lib/utils";
// IMPORTANTE: Importamos el tipo UploadState
import { uploadDataset, type UploadState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-medium h-9"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processing...
        </>
      ) : (
        "Upload & Process"
      )}
    </Button>
  );
}

export default function NewDatasetPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      setError("Please select a valid CSV file.");
      return;
    }

    // FIX: Usamos 'as UploadState' en vez de 'as any' para contentar a ESLint
    const result = await uploadDataset({} as UploadState, formData);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    }
  }

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = [["date", "amount", "product", "category"]];
    const exampleRow = [["2024-01-01", "150.50", "Coffee Blend", "Beverages"]];
    downloadCsv("template_revenuelens.csv", [...headers, ...exampleRow]);
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
          <form className="space-y-5" action={clientAction}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dataset Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                placeholder="e.g. Q1 Sales 2024"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                CSV File
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer relative group">
                <input
                  name="file"
                  type="file"
                  accept=".csv"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setFileName(f ? f.name : null);
                    setError(null);
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-slate-700 block">
                      {fileName || "Click to upload CSV"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Required columns: date, amount
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
              <SubmitButton />
            </div>
          </form>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}
