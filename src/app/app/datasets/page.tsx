"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2, Plus, Trash2 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
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
  AlertDialogTitle,
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          router.replace("/auth/sign-in");
          return;
        }

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <TableSkeleton />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <StaggerContainer className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center mt-8 max-w-2xl mx-auto">
        <StaggerItem>
          <div className="h-10 w-10 mx-auto bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 mb-3 shadow-sm">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            No datasets found
          </h3>
          <p className="mt-1 text-xs text-slate-500 mb-5 max-w-xs mx-auto">
            Upload a CSV file to start analyzing your revenue data.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/app/datasets/new")}
            className="bg-slate-900 h-8"
          >
            <Plus className="mr-2 h-3.5 w-3.5" /> Upload CSV
          </Button>
        </StaggerItem>
      </StaggerContainer>
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
