"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2, Plus, Trash2 } from "lucide-react";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
import { TableSkeleton } from "@/components/ui/skeletons";
import type { DatasetView } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function DatasetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<DatasetView[]>([]);
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      try {
        setLoading(true);

        // 1. Verificación básica de usuario
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          router.replace("/auth/sign-in");
          return;
        }

        // 2. Consulta OPTIMIZADA a la vista SQL
        // IMPORTANTE: Requiere haber creado la vista 'datasets_with_counts' en Supabase
        const { data, error } = await supabase
          .from("datasets_with_counts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setDatasets(data || []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) toast.error("Failed to load datasets.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("datasets")
        .delete()
        .eq("id", datasetToDelete);

      if (error) throw error;

      setDatasets((prev) => prev.filter((d) => d.id !== datasetToDelete));
      toast.success("Dataset deleted");
    } catch {
      toast.error("Failed to delete dataset");
    } finally {
      setIsDeleting(false);
      setDatasetToDelete(null);
    }
  };

  // Loading State unificado
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <TableSkeleton />
      </div>
    );
  }

  // Empty State
  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center mt-8">
        <StaggerItem>
          <div className="flex h-12 w-12 mx-auto items-center justify-center bg-white shadow-sm border border-slate-100 mb-4">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No datasets yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Upload your first CSV file to start analyzing revenue.
          </p>
          <Button onClick={() => router.push("/app/datasets/new")}>
            <Plus className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Tabla principal
  return (
    <StaggerContainer className="space-y-6 max-w-5xl mx-auto">
      <StaggerItem className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Datasets</h1>
          <p className="text-sm text-slate-500">Manage your sales sources.</p>
        </div>
        <Button
          onClick={() => router.push("/app/datasets/new")}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </StaggerItem>

      <StaggerItem>
        <HoverCard className="overflow-hidden border-slate-200 shadow-sm p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Rows</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {datasets.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {d.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                      {d.rows_count?.toLocaleString() ?? "0"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDatasetToDelete(d.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HoverCard>
      </StaggerItem>

      {/* Modal de Confirmación */}
      <AlertDialog
        open={!!datasetToDelete}
        onOpenChange={(open) => !open && setDatasetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the dataset and all its sales data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaggerContainer>
  );
}
