// src/app/app/datasets/datasets-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2, Plus, Trash2 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import type { DatasetView } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface DatasetsClientProps {
  initialDatasets: DatasetView[];
}

export default function DatasetsClient({
  initialDatasets,
}: DatasetsClientProps) {
  const router = useRouter();
  // Inicializamos estado con datos del servidor (¡Instantáneo!)
  const [datasets, setDatasets] = useState<DatasetView[]>(initialDatasets);

  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("datasets")
        .delete()
        .eq("id", datasetToDelete);
      if (error) throw error;

      // Actualizamos la UI optimísticamente
      setDatasets((prev) => prev.filter((d) => d.id !== datasetToDelete));
      toast.success("Dataset deleted");
      router.refresh(); // Sincronizamos servidor por si acaso
    } catch {
      toast.error("Failed to delete dataset");
    } finally {
      setIsDeleting(false);
      setDatasetToDelete(null);
    }
  };

  // --- UI EXACTA (Sin Skeletons) ---

  if (datasets.length === 0) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="No datasets found"
        description="Upload a CSV file to start analyzing your revenue data."
        className="mt-8 max-w-2xl"
        action={
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 h-8"
          >
            <Plus className="mr-2 h-3.5 w-3.5" /> Upload CSV
          </Button>
        }
      />
    );
  }

  return (
    <StaggerContainer className="space-y-4 max-w-5xl mx-auto">
      <StaggerItem className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Datasets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your sales sources and imports.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => router.push("/app/datasets/new")}
          className="bg-slate-900 text-white h-8 px-3 hover:bg-slate-800"
        >
          <Plus className="mr-2 h-3.5 w-3.5" /> New Dataset
        </Button>
      </StaggerItem>

      <StaggerItem>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Created</th>
                  <th className="px-4 py-3 font-bold text-right">Rows</th>
                  <th className="px-4 py-3 font-bold text-right w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {datasets.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {d.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 font-mono text-xs">
                      {d.rows_count?.toLocaleString() ?? "0"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDatasetToDelete(d.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StaggerItem>

      <AlertDialog
        open={!!datasetToDelete}
        onOpenChange={(open) => !open && setDatasetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Delete dataset?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently remove the dataset and all its sales data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-xs h-8"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaggerContainer>
  );
}
