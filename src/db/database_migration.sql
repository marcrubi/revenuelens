-- 1. CONFIGURACIÓN DE TABLAS (Estado para evitar corrupción de datos)
ALTER TABLE public.datasets ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing';
ALTER TABLE public.datasets DROP CONSTRAINT IF EXISTS check_dataset_status;
ALTER TABLE public.datasets ADD CONSTRAINT check_dataset_status CHECK (status IN ('processing', 'ready', 'error'));

-- 2. LIMPIEZA DE VISTAS (Para evitar conflictos al actualizar)
DROP VIEW IF EXISTS public.datasets_with_counts;
DROP VIEW IF EXISTS public.daily_metrics;
DROP VIEW IF EXISTS public.dataset_kpis;

-- 3. RECREACIÓN DE VISTAS (Con Security Invoker para RLS)

-- Vista: Métricas Diarias (Gráficos)
CREATE OR REPLACE VIEW public.daily_metrics
WITH (security_invoker = true)
AS
SELECT
    dataset_id,
    date,
    SUM(amount) as revenue,
    COUNT(id) as orders_count,
    COALESCE(AVG(amount), 0) as avg_ticket
FROM public.sales
GROUP BY dataset_id, date;

-- Vista: Listado de Datasets
CREATE OR REPLACE VIEW public.datasets_with_counts
WITH (security_invoker = true)
AS
SELECT
    d.id,
    d.business_id,
    d.name,
    d.created_at,
    d.status,
    count(s.id) AS rows_count
FROM public.datasets d
         LEFT JOIN public.sales s ON d.id = s.dataset_id
GROUP BY d.id, d.business_id, d.name, d.created_at, d.status;

-- Vista: KPIs Globales (Para carga rápida inicial)
CREATE OR REPLACE VIEW public.dataset_kpis
WITH (security_invoker = true)
AS
SELECT
    dataset_id,
    SUM(amount) as total_revenue,
    COUNT(id) as total_orders,
    COALESCE(AVG(amount), 0) as avg_ticket
FROM public.sales
GROUP BY dataset_id;

-- 4. FUNCIONES RPC (Lógica de Negocio Segura)

-- KPI Summary (Dinámico con fechas)
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_dataset_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  total_revenue numeric,
  total_orders bigint,
  avg_ticket numeric
)
SECURITY INVOKER
AS $$
BEGIN
RETURN QUERY
SELECT
    COALESCE(SUM(amount), 0) as total_revenue,
    COUNT(id) as total_orders,
    COALESCE(AVG(amount), 0) as avg_ticket
FROM public.sales
WHERE dataset_id = p_dataset_id
  AND date >= p_start_date
  AND date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Top Products
CREATE OR REPLACE FUNCTION get_top_products(
  p_dataset_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS TABLE (product text, revenue numeric)
SECURITY INVOKER
AS $$
BEGIN
RETURN QUERY
SELECT
    COALESCE(s.product, 'Unknown') AS product,
    SUM(s.amount) AS revenue
FROM public.sales s
WHERE s.dataset_id = p_dataset_id
  AND s.date >= p_start_date
  AND s.date <= p_end_date
GROUP BY s.product
ORDER BY revenue DESC
    LIMIT 7;
END;
$$ LANGUAGE plpgsql;

-- Batch Import (Carga masiva optimizada)
CREATE OR REPLACE FUNCTION import_sales_batch(
  p_dataset_id uuid,
  p_sales jsonb
) RETURNS void
SECURITY INVOKER
AS $$
BEGIN
INSERT INTO public.sales (dataset_id, date, amount, product, category, customer_id)
SELECT
    p_dataset_id,
    (x->>'date')::date,
    (x->>'amount')::numeric,
    x->>'product',
    x->>'category',
    x->>'customer_id'
FROM jsonb_array_elements(p_sales) AS x;
END;
$$ LANGUAGE plpgsql;

-- 5. PERMISOS
GRANT EXECUTE ON FUNCTION get_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_summary TO service_role;
GRANT EXECUTE ON FUNCTION get_top_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products TO service_role;
GRANT EXECUTE ON FUNCTION import_sales_batch TO authenticated;
GRANT EXECUTE ON FUNCTION import_sales_batch TO service_role;