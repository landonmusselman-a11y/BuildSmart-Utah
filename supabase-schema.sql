-- Run this in your Supabase SQL editor
-- https://supabase.com/dashboard/project/dieoqiqswafcuhhhhbvy/sql

-- ─── EXISTING TABLES ─────────────────────────────────────────────────────────

create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text not null,
  source text default 'BuildSmart Utah',
  budget text,
  areas text,
  priorities text,
  home_type text,
  timeline text,
  pre_approval text,
  matched_communities text,
  builder_interest text,
  community_interest text,
  message text
);

-- Enable Row Level Security
alter table leads enable row level security;

-- Service role can do everything (server-side only)
create policy "Service role full access" on leads
  using (true)
  with check (true);

-- ─── BOOKINGS TABLE ──────────────────────────────────────────────────────────

create table if not exists bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  date date not null,
  time_slot text not null,
  name text not null,
  email text not null,
  phone text,
  notes text,
  status text default 'pending'  -- pending | confirmed | cancelled
);

alter table bookings enable row level security;

create policy "Service role full access" on bookings
  using (true)
  with check (true);

-- ─── FINANCE TRACKER TABLES ──────────────────────────────────────────────────

create table if not exists finance_accounts (
  id text primary key,
  name text not null,
  institution text,
  type text,
  balance decimal default 0,
  last_updated timestamptz default now()
);

create table if not exists finance_transactions (
  id text primary key,
  account_id text references finance_accounts(id) on delete cascade,
  date text,
  description text,
  amount decimal,
  category text default 'Other',
  subcategory text,
  notes text,
  is_airbnb boolean default false
);

create table if not exists finance_airbnb_entries (
  id text primary key,
  property_name text,
  date text,
  type text,
  description text,
  amount decimal,
  year integer
);

create table if not exists finance_investment_accounts (
  id text primary key,
  name text,
  institution text,
  last_updated timestamptz default now(),
  total_value decimal default 0
);

create table if not exists finance_investment_holdings (
  id serial primary key,
  account_id text references finance_investment_accounts(id) on delete cascade,
  symbol text,
  name text,
  shares decimal,
  price decimal,
  value decimal,
  cost_basis decimal,
  gain_loss decimal
);

create table if not exists finance_tax_documents (
  id text primary key,
  year integer,
  type text,
  description text,
  payer text,
  amount decimal default 0,
  uploaded_at timestamptz default now(),
  file_name text,
  file_url text
);

create table if not exists finance_settings (
  id text primary key default 'default',
  monthly_budget decimal default 10000
);

insert into finance_settings (id, monthly_budget)
  values ('default', 10000)
  on conflict (id) do nothing;

-- Storage bucket for uploaded documents
insert into storage.buckets (id, name, public)
  values ('finance-documents', 'finance-documents', false)
  on conflict do nothing;
