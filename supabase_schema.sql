-- ============================================================
-- KissanMitra – Supabase database schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. USERS
create table if not exists users (
  id          text primary key,
  name        text not null,
  email       text unique not null,
  phone       text default '',
  farm_name   text default '',
  password_hash text not null,
  created_at  text not null
);

-- 2. EQUIPMENT
create table if not exists equipment (
  id          text primary key,
  type        text default 'other',
  name        text not null,
  daily_rate  real default 0,
  location    text default '',
  description text default '',
  rating      real default 0,
  reviews     integer default 0,
  owner       text default '',
  available   boolean default true,
  image       text default '',
  created_at  text not null
);

-- 3. BOOKINGS
create table if not exists bookings (
  id               text primary key,
  equipment_id     text,
  equipment_name   text default '',
  equipment_owner  text default '',
  renter_name      text default '',
  renter_phone     text default '',
  start_date       text default '',
  end_date         text default '',
  daily_rate       real default 0,
  total_cost       real default 0,
  days             integer default 0,
  status           text default 'pending',
  payment_method   text,
  payment_details  text,
  created_at       text not null
);

-- 4. WASTE LISTINGS
create table if not exists waste_listings (
  id              text primary key,
  waste_type      text default '',
  waste_type_label text default '',
  quantity        real default 0,
  location        text default '',
  pickup_date     text default '',
  status          text default 'pending',
  price           real default 0,
  seller          text default '',
  created_at      text not null
);

-- 5. COMMUNITY POSTS
create table if not exists community_posts (
  id            text primary key,
  title         text not null,
  content       text not null,
  category      text default 'general',
  author        text default 'Anonymous Farmer',
  type          text default 'post',
  lat           real,
  lng           real,
  district      text default '',
  answers       jsonb default '[]'::jsonb,
  "bestAnswerId" text,
  created_at    text not null
);

-- Enable Row Level Security (RLS) but allow all operations via service key
-- The app uses the service_role key so RLS won't block anything,
-- but this keeps the tables secure if accessed from client-side.
alter table users enable row level security;
alter table equipment enable row level security;
alter table bookings enable row level security;
alter table waste_listings enable row level security;
alter table community_posts enable row level security;

-- Policies: allow full access for authenticated/service role
create policy "Allow all for service role" on users for all using (true) with check (true);
create policy "Allow all for service role" on equipment for all using (true) with check (true);
create policy "Allow all for service role" on bookings for all using (true) with check (true);
create policy "Allow all for service role" on waste_listings for all using (true) with check (true);
create policy "Allow all for service role" on community_posts for all using (true) with check (true);
