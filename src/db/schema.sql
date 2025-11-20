-- Businesses
create table if not exists public.businesses (
                                                 id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now()
    );

-- Profiles (link a auth.users)
create table if not exists public.profiles (
                                               id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    business_id uuid references public.businesses(id),
    created_at timestamptz not null default now()
    );

-- Datasets
create table if not exists public.datasets (
                                               id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now()
    );

-- Sales
create table if not exists public.sales (
                                            id uuid primary key default gen_random_uuid(),
    dataset_id uuid not null references public.datasets(id) on delete cascade,
    date date not null,
    amount numeric not null,
    product text,
    category text,
    customer_id text,
    created_at timestamptz not null default now()
    );

-- Subscription plans (futuro)
create table if not exists public.subscription_plans (
                                                         id uuid primary key default gen_random_uuid(),
    name text not null,
    price_monthly_cents integer not null,
    stripe_price_id text,
    created_at timestamptz not null default now()
    );

-- Subscriptions (futuro)
create table if not exists public.subscriptions (
                                                    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    plan_id uuid not null references public.subscription_plans(id),
    stripe_customer_id text,
    stripe_subscription_id text,
    status text not null default 'inactive',
    current_period_end timestamptz,
    created_at timestamptz not null default now()
    );
-- SEGURIDAD (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Access business via profile" ON businesses FOR ALL USING (
  id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Create business" ON businesses FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Access datasets via business" ON datasets FOR ALL USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Access sales via dataset" ON sales FOR ALL USING (
  dataset_id IN (
    SELECT id FROM datasets WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  )
);
    -- Añade esto a tu schema.sql para evitar desastres en nuevos deploys
CREATE OR REPLACE VIEW public.datasets_with_counts
WITH (security_invoker = true) -- ¡Recuerda esto para la seguridad!
AS
SELECT
    d.id,
    d.business_id,
    d.name,
    d.created_at,
    count(s.id) AS rows_count
FROM datasets d
         LEFT JOIN sales s ON d.id = s.dataset_id
GROUP BY d.id;