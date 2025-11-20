// src/app/app/datasets/page.tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DatasetsClient from "./datasets-client";
import { DatasetView } from "@/types";

export default async function DatasetsPage() {
  const supabase = await createSupabaseServerClient();

  // Consulta de Servidor
  // Usamos la vista SQL para obtener el conteo de filas de forma eficiente
  const { data, error } = await supabase
    .from("datasets_with_counts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching datasets:", error);
  }

  // Forzamos el tipo aquí para asegurar que coincida con la prop del cliente
  const datasets = (data || []) as DatasetView[];

  return <DatasetsClient initialDatasets={datasets} />;
}
