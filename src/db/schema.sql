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
