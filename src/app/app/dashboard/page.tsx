import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DashboardClient from "./dashboard-client";
import { Dataset } from "@/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // 1. Obtener Datasets
  const { data: rawDatasets } = await supabase
    .from("datasets")
    .select("id, name, created_at, business_id")
    .order("created_at", { ascending: false });

  const datasets = (rawDatasets ?? []) as Dataset[];
  let initialData = null;

  if (datasets.length > 0) {
    const firstId = datasets[0].id;

    // --- CORRECCIÓN 1: Definir las variables de fecha que faltaban ---
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90); // Default: Últimos 90 días para carga inicial

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    // ---------------------------------------------------------------

    const [dailyRes, kpiRes, productsRes] = await Promise.all([
      // A. Gráfica (Vista SQL - Trae fechas y revenue ya sumado)
      supabase
        .from("daily_metrics")
        .select("date, revenue")
        .eq("dataset_id", firstId)
        .gte("date", startStr) // Filtramos por fecha para que coincida
        .lte("date", endStr)
        .order("date", { ascending: true }),

      // B. KPIs Totales (Vista SQL)
      supabase
        .from("dataset_kpis")
        .select("*")
        .eq("dataset_id", firstId)
        .single(),

      // C. Top Products (RPC)
      supabase.rpc("get_top_products", {
        p_dataset_id: firstId,
        p_start_date: startStr,
        p_end_date: endStr,
      }),
    ]);

    if (dailyRes.data && kpiRes.data) {
      const chartData = dailyRes.data.map((d) => ({
        date: String(d.date),
        revenue: Number(d.revenue),
      }));

      // --- CORRECCIÓN 2: Mapeo directo del RPC (ya viene sumado) ---
      // No necesitamos un Map ni bucles complejos, el SQL ya hizo el trabajo sucio.
      const topProducts = (productsRes.data || []).map((p: any) => ({
        product: p.product,
        revenue: Number(p.revenue),
      }));

      const topProduct = topProducts[0] || null;
      const totalRevenue = kpiRes.data.total_revenue || 0;

      initialData = {
        kpis: {
          totalRevenue: totalRevenue,
          orders: kpiRes.data.total_orders || 0,
          avgTicket: kpiRes.data.avg_ticket || 0,
          topProduct: topProduct?.product || null,
          topProductShare: topProduct ? topProduct.revenue / totalRevenue : 0,
        },
        chartData,
        topProducts,
        categories: [],
      };
    }
  }

  return (
    <DashboardClient initialDatasets={datasets} initialData={initialData} />
  );
}
