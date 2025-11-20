import { createSupabaseServerClient } from "@/lib/supabaseServer";
import PredictionsClient from "./predictions-client";
import { Dataset } from "@/types";
import { generateForecast, PredictionPoint } from "@/lib/analytics";

export default async function PredictionsPage() {
  const supabase = await createSupabaseServerClient();

  // 1. Datasets
  const { data: rawDatasets } = await supabase
    .from("datasets")
    .select("id, name, created_at, business_id")
    .order("created_at", { ascending: false });

  const datasets = (rawDatasets ?? []) as Dataset[];
  let initialPoints: PredictionPoint[] = [];
  let initialDatasetId = "";

  if (datasets.length > 0) {
    initialDatasetId = datasets[0].id;

    // 2. OPTIMIZACIÓN: Usar la Vista SQL 'daily_metrics'
    // En lugar de traer 50.000 ventas, traemos 365 filas (1 año) ya sumadas.
    const { data: dailySales } = await supabase
      .from("daily_metrics")
      .select("date, revenue")
      .eq("dataset_id", initialDatasetId)
      .order("date", { ascending: true })
      .limit(365); // Máximo 1 año de historia

    if (dailySales && dailySales.length >= 7) {
      // Mapeo directo, ya viene sumado de la DB
      const historicalPoints = dailySales.map((d) => ({
        date: String(d.date), // Asegurar string
        revenue: Number(d.revenue),
      }));

      // Generamos forecast
      initialPoints = generateForecast(historicalPoints, 14);
    }
  }

  return (
    <PredictionsClient
      initialDatasets={datasets}
      initialPoints={initialPoints}
      initialDatasetId={initialDatasetId}
    />
  );
}
