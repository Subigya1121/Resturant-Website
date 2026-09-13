-- ============================================================
-- DABALI — DATABASE SCHEMA
-- Run this once in Supabase: SQL Editor > New query > paste > Run
-- ============================================================

-- RESERVATIONS TABLE
create table reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  reservation_date date not null,
  reservation_time time not null,
  guest_count integer not null check (guest_count between 1 and 20),
  special_request text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  confirmation_code text not null,
  created_at timestamptz not null default now()
);

-- CONTACT MESSAGES TABLE
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (your website visitors) can only INSERT — they can never
-- read anyone else's reservation or message.
-- Only a logged-in admin (authenticated user) can SELECT/view them.
-- ============================================================

alter table reservations enable row level security;
alter table contact_messages enable row level security;

create policy "Public can submit reservations"
  on reservations for insert
  to anon
  with check (true);

create policy "Admin can view reservations"
  on reservations for select
  to authenticated
  using (true);

create policy "Admin can update reservations"
  on reservations for update
  to authenticated
  using (true);

create policy "Public can submit messages"
  on contact_messages for insert
  to anon
  with check (true);

create policy "Admin can view messages"
  on contact_messages for select
  to authenticated
  using (true);
