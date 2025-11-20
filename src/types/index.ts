// src/types/index.ts

// Perfil de usuario
export type Profile = {
  id: string;
  full_name: string | null;
  business_id: string | null;
  created_at?: string;
  businesses?: {
    name: string;
  } | null;
};

// Negocio
export type Business = {
  id: string;
  name: string;
  created_at?: string;
};

// Datasets (Tabla base)
export type Dataset = {
  id: string;
  business_id: string;
  name: string;
  created_at: string;
};

// Dataset Optimizado (Vista SQL)
// Esta es la interfaz correcta para lectura en listados
export type DatasetView = Dataset & {
  rows_count: number; // Mantenemos snake_case que viene de Postgres
};

// Ventas
export type Sale = {
  id: string;
  dataset_id: string;
  date: string;
  amount: number;
  product: string | null;
  category: string | null;
  customer_id?: string | null;
};

// KPIs
export type Kpis = {
  totalRevenue: number;
  orders: number;
  avgTicket: number;
  topProduct: string | null;
  topProductShare: number | null;
};

// Gráficas
export type ChartPoint = {
  date: string;
  revenue: number;
};

export type ProductRow = {
  product: string;
  revenue: number;
};

export type CategoryRow = {
  category: string;
  revenue: number;
};
