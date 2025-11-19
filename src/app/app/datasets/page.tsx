// src/app/app/datasets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type DatasetRow = {
  id: string;
  name: string;
  created_at: string;
  rowsCount: number | null;
};

export default function DatasetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      setLoading(true);
      setError(null);

      try {
        // 1) Usuario
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (!isMounted) return;

        if (authError || !authData?.user) {
          router.replace("/auth/sign-in");
          return;
        }

        const userId = authData.user.id;

        // 2) Profile -> business_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", userId)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError) {
          setError("We couldn't load your workspace profile.");
          setLoading(false);
          setWorkspaceLoading(false);
          return;
        }

        if (!profile?.business_id) {
          // AppShell debería crear el workspace si falta.
          // Aquí mostramos un estado suave, no un error duro.
          setWorkspaceLoading(true);
          setLoading(false);
          return;
        }

        setWorkspaceLoading(false);

        // 3) Datasets del negocio (multi-tenant OK)
        const { data: ds, error: dsError } = await supabase
          .from("datasets")
          .select("id, name, created_at")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (dsError) {
          setError("We couldn't load your datasets.");
          setLoading(false);
          return;
        }

        const base = (ds ?? []) as {
          id: string;
          name: string;
          created_at: string;
        }[];

        // 4) N+1 para contar filas (suficiente para v1.0)
        const withCounts: DatasetRow[] = [];
        for (const d of base) {
          const { count, error: countError } = await supabase
            .from("sales")
            .select("id", { count: "exact", head: true })
            .eq("dataset_id", d.id);

          if (!isMounted) return;

          if (countError) {
            withCounts.push({
              id: d.id,
              name: d.name,
              created_at: d.created_at,
              rowsCount: null,
            });
          } else {
            withCounts.push({
              id: d.id,
              name: d.name,
              created_at: d.created_at,
              rowsCount: count ?? 0,
            });
          }
        }

        setDatasets(withCounts);
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading datasets.");
        setLoading(false);
        setWorkspaceLoading(false);
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const renderContent = () => {
    if (workspaceLoading && !error && !datasets.length) {
      return (
        <Card className="p-4">
          <p className="text-sm text-slate-500">
            Setting up your workspace… If this takes more than a few seconds,
            try refreshing the page.
          </p>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card className="p-4">
          <p className="text-sm text-slate-500">Loading your datasets…</p>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      );
    }

    if (!datasets.length) {
      return (
        <Card className="p-4">
          <p className="text-sm text-slate-500">
            You don&apos;t have any datasets yet. Upload your first CSV to get
            started.
          </p>
        </Card>
      );
    }

    return (
      <Card className="p-0 overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="border-b border-slate-200 px-4 py-2 text-left font-medium">
                Name
              </th>
              <th className="border-b border-slate-200 px-4 py-2 text-left font-medium">
                Created at
              </th>
              <th className="border-b border-slate-200 px-4 py-2 text-right font-medium">
                Rows
              </th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((d) => {
              const created = d.created_at
                ? new Date(d.created_at).toLocaleDateString()
                : "—";
              return (
                <tr
                  key={d.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-2">
                    <span className="font-medium text-slate-800">{d.name}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{created}</td>
                  <td className="px-4 py-2 text-right text-slate-700">
                    {d.rowsCount === null ? "—" : d.rowsCount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Datasets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Each dataset is a separate sales export powering dashboards and
            forecasts.
          </p>
        </div>

        <Button
          onClick={() => router.push("/app/datasets/new")}
          className="rounded-full"
        >
          New dataset
        </Button>
      </div>

      {renderContent()}
    </div>
  );
}
