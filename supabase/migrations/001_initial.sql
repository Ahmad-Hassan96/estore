-- ================================================
-- CLOTHING STORE — INITIAL MIGRATION
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================
-- PRODUCTS
-- ================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  gender text default 'women' check (gender in ('women', 'men', 'unisex')),
  category text not null,
  collection text,
  tags text[] default '{}',
  pieces int default 3 check (pieces in (2, 3)),
  fabric_details text,
  images text[] not null default '{}',
  stock int not null default 0,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ================================
-- ORDERS
-- ================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null default '',
  user_id uuid references auth.users,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  city text not null,
  province text not null default 'Punjab',
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) default 200,
  total numeric(10,2) not null,
  status text default 'pending'
    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method text default 'cod',
  notes text,
  tracking_number text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Auto-generate order number
create or replace function generate_order_number()
returns trigger as $$
declare
  year_str text := to_char(now(), 'YYYY');
  seq int;
begin
  select count(*) + 1 into seq from orders
  where extract(year from created_at) = extract(year from now());
  new.order_number := 'ORD-' || year_str || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger orders_order_number
  before insert on orders
  for each row execute function generate_order_number();

-- ================================
-- PROFILES
-- ================================
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  default_city text,
  default_address text,
  default_province text default 'Punjab',
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ================================
-- ROW LEVEL SECURITY
-- ================================

alter table products enable row level security;
alter table orders enable row level security;
alter table profiles enable row level security;

-- Products
create policy "Products are publicly readable"
  on products for select using (is_active = true);

create policy "Admins manage products"
  on products for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Orders
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Anyone can insert orders"
  on orders for insert with check (true);

create policy "Admins manage all orders"
  on orders for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Profiles
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id);

-- ================================
-- STORAGE BUCKET
-- ================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ================================
-- INDEXES
-- ================================
create index if not exists products_gender_idx on products(gender);
create index if not exists products_category_idx on products(category);
create index if not exists products_is_active_idx on products(is_active);
create index if not exists products_is_featured_idx on products(is_featured);
create index if not exists products_created_at_idx on products(created_at desc);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- ================================
-- MAKE YOURSELF ADMIN
-- After running this migration, sign up with your admin email,
-- then run this query to grant admin access:
--
-- update profiles set role = 'admin' where id = 'YOUR-USER-UUID';
--
-- Find your UUID in: Supabase Dashboard → Authentication → Users
-- ================================
