// src/lib/analytics.ts
import { CategoryRow, ChartPoint, Kpis, ProductRow, Sale } from "@/types";

export type DashboardSummary = {
  kpis: Kpis;
  chartData: ChartPoint[];
  topProducts: ProductRow[];
  categories: CategoryRow[];
};

export type RangeOption = "30" | "90" | "all";

export function processSalesData(
  sales: Sale[],
  range: RangeOption,
): DashboardSummary | null {
  if (!sales || sales.length === 0) return null;

  // 1. Filtrado por fecha
  let filtered = [...sales];
  if (range !== "all") {
    // Ordenar para encontrar la última fecha
    const sorted = [...sales].sort((a, b) => a.date.localeCompare(b.date));
    const lastDateStr = sorted[sorted.length - 1].date;
    const lastDate = new Date(lastDateStr);

    // Calcular fecha de corte
    const cutoff = new Date(lastDate);
    cutoff.setDate(lastDate.getDate() - (range === "30" ? 29 : 89));
    const minStr = cutoff.toISOString().slice(0, 10);

    filtered = sales.filter((s) => s.date >= minStr);
  }

  // Si tras filtrar no queda nada, retornamos estructura vacía o null
  if (filtered.length === 0) return null;

  // 2. Cálculos de Agregación
  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.amount), 0);
  const orders = filtered.length;
  const avgTicket = orders > 0 ? totalRevenue / orders : 0;

  const revByProduct = new Map<string, number>();
  const revByCategory = new Map<string, number>();
  const revByDate = new Map<string, number>();

  for (const s of filtered) {
    const amt = Number(s.amount);
    const pKey = s.product?.trim() || "Unspecified";
    const cKey = s.category?.trim() || "Unspecified";
    // Asumimos formato ISO YYYY-MM-DD
    const dKey = s.date.slice(0, 10);

    revByProduct.set(pKey, (revByProduct.get(pKey) ?? 0) + amt);
    revByCategory.set(cKey, (revByCategory.get(cKey) ?? 0) + amt);
    revByDate.set(dKey, (revByDate.get(dKey) ?? 0) + amt);
  }

  // 3. Top Product Logic
  let topProduct: string | null = null;
  let topRevenue = 0;
  for (const [prod, rev] of revByProduct.entries()) {
    if (rev > topRevenue) {
      topRevenue = rev;
      topProduct = prod;
    }
  }
  const topProductShare = totalRevenue > 0 ? topRevenue / totalRevenue : 0;

  return {
    kpis: {
      totalRevenue,
      orders,
      avgTicket,
      topProduct,
      topProductShare,
    },
    chartData: Array.from(revByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: Array.from(revByProduct.entries())
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    categories: Array.from(revByCategory.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  };
}
// ... (código anterior de processSalesData)

// Tipos para Predicciones
export type PredictionPoint = {
  date: string;
  revenue: number;
  type: "history" | "forecast";
  lowerBound?: number; // Opcional para intervalos de confianza visuales
  upperBound?: number;
};

// Algoritmo de Media Móvil Simple (SMA) para predicción
// Mucho mejor que Math.random()
export function generateForecast(
  historical: ChartPoint[],
  horizonDays: number,
): PredictionPoint[] {
  if (historical.length < 7) return [];

  const sorted = [...historical].sort((a, b) => a.date.localeCompare(b.date));

  // 1. Convertimos historia a puntos de predicción
  const result: PredictionPoint[] = sorted.map((p) => ({
    date: p.date,
    revenue: p.revenue,
    type: "history",
  }));

  const lastDateStr = sorted[sorted.length - 1].date;
  const lastDate = new Date(lastDateStr);

  // Usamos los últimos valores para proyectar
  // (Simulación básica: tomamos la media de los últimos 7 días como base)
  const windowSize = 7;
  let rollingWindow = sorted.slice(-windowSize).map((s) => s.revenue);

  for (let i = 1; i <= horizonDays; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    // Calcular media de la ventana actual
    const avg =
      rollingWindow.reduce((sum, val) => sum + val, 0) / rollingWindow.length;

    // Añadimos un pequeño factor de tendencia o ruido controlado si se quiere,
    // pero la media móvil es un forecast estándar "safe".
    const forecastValue = Math.max(0, avg);

    result.push({
      date: nextDate.toISOString().slice(0, 10),
      revenue: forecastValue,
      type: "forecast",
    });

    // Actualizar ventana deslizante (sacar el primero, meter el nuevo)
    rollingWindow.shift();
    rollingWindow.push(forecastValue);
  }

  return result;
}
