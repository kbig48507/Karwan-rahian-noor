-- Karwan Rahiyaan Noor tables use the krn_ prefix to avoid collisions with existing projects.
-- Re-running this script preserves data in existing tables.
-- Run in Supabase SQL Editor. Create the first Auth user in the dashboard, then
-- insert its UUID into public.krn_staff_profiles with role = 'admin'.
create extension if not exists pgcrypto;
create table if not exists public.krn_staff_profiles(user_id uuid primary key references auth.users(id) on delete cascade, full_name text not null, role text not null check(role in ('admin','manager','finance','visa','sales','viewer')), active boolean not null default true, created_at timestamptz not null default now());
create or replace function public.krn_staff_role() returns text language sql stable security definer set search_path=public as $$select role from public.krn_staff_profiles where user_id=auth.uid() and active=true limit 1$$;
revoke all on function public.krn_staff_role() from public;
grant execute on function public.krn_staff_role() to authenticated;
create table if not exists public.krn_agents(id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, commission_rate numeric(5,2) not null default 0 check(commission_rate between 0 and 100), created_at timestamptz not null default now());
create table if not exists public.krn_pilgrims(id uuid primary key default gen_random_uuid(), full_name text not null, passport_number text not null unique, nationality text, date_of_birth date, passport_expiry date, phone text, agent_id uuid references public.krn_agents(id), created_at timestamptz not null default now());
create table if not exists public.krn_travel_groups(id uuid primary key default gen_random_uuid(), name text not null, departure_date date, return_date date, leader_name text, capacity integer check(capacity>0), status text not null default 'planning' check(status in ('planning','open','closed','departed','returned','cancelled')), created_at timestamptz not null default now());
create table if not exists public.krn_packages(id uuid primary key default gen_random_uuid(), name text not null, destinations text not null, duration_days integer check(duration_days>0), selling_price numeric(14,2) not null default 0 check(selling_price>=0), cost_price numeric(14,2) not null default 0 check(cost_price>=0), status text not null default 'draft', created_at timestamptz not null default now());
create table if not exists public.krn_bookings(id uuid primary key default gen_random_uuid(), booking_reference text not null unique, pilgrim_id uuid not null references public.krn_pilgrims(id), package_id uuid references public.krn_packages(id), group_id uuid references public.krn_travel_groups(id), total_amount numeric(14,2) not null default 0 check(total_amount>=0), status text not null default 'enquiry' check(status in ('enquiry','confirmed','in_process','completed','cancelled')), created_at timestamptz not null default now());
create table if not exists public.krn_tickets(id uuid primary key default gen_random_uuid(), booking_id uuid references public.krn_bookings(id), passenger_name text not null, ticket_type text not null check(ticket_type in ('group','individual')), airline text, pnr text, ticket_number text, departure_date date, cost_amount numeric(14,2) not null default 0 check(cost_amount>=0), created_at timestamptz not null default now());
create table if not exists public.krn_visa_cases(id uuid primary key default gen_random_uuid(), pilgrim_id uuid not null references public.krn_pilgrims(id), booking_id uuid references public.krn_bookings(id), country text not null, visa_type text not null check(visa_type in ('group','individual')), status text not null default 'draft' check(status in ('draft','submitted','in_review','approved','rejected','cancelled')), submission_date date, reference_number text, created_at timestamptz not null default now());
create table if not exists public.krn_suppliers(id uuid primary key default gen_random_uuid(), name text not null, supplier_type text not null, contact_name text, phone text, email text, created_at timestamptz not null default now());
create table if not exists public.krn_ledger_entries(id uuid primary key default gen_random_uuid(), party_type text not null check(party_type in ('pilgrim','agent','supplier')), party_id uuid not null, entry_type text not null check(entry_type in ('receipt','payment','charge','refund','adjustment')), amount numeric(14,2) not null check(amount>0), description text, reference text, created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now());
create index if not exists krn_ledger_party_idx on public.krn_ledger_entries(party_type,party_id,created_at);
create table if not exists public.krn_audit_events(id bigint generated always as identity primary key, actor_id uuid default auth.uid(), table_name text not null, row_id uuid not null, action text not null, old_data jsonb, new_data jsonb, created_at timestamptz not null default now());
create or replace function public.krn_audit_row() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if TG_OP = 'DELETE' then
    insert into public.krn_audit_events(table_name,row_id,action,old_data,new_data)
      values(TG_TABLE_NAME,old.id,TG_OP,to_jsonb(old),null);
    return old;
  else
    insert into public.krn_audit_events(table_name,row_id,action,old_data,new_data)
      values(TG_TABLE_NAME,new.id,TG_OP,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
    return new;
  end if;
end$$;
do $$declare t text; begin foreach t in array array['krn_agents','krn_pilgrims','krn_travel_groups','krn_packages','krn_bookings','krn_tickets','krn_visa_cases','krn_suppliers','krn_ledger_entries'] loop execute format('drop trigger if exists audit_%I on public.%I',t,t);execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.krn_audit_row()',t,t);end loop;end$$;
do $$declare t text; begin foreach t in array array['krn_staff_profiles','krn_agents','krn_pilgrims','krn_travel_groups','krn_packages','krn_bookings','krn_tickets','krn_visa_cases','krn_suppliers','krn_ledger_entries','krn_audit_events'] loop execute format('alter table public.%I enable row level security',t); execute format('drop policy if exists staff_read on public.%I',t);execute format('create policy staff_read on public.%I for select to authenticated using (public.krn_staff_role() is not null)',t);end loop;end$$;
do $$declare t text; begin foreach t in array array['krn_agents','krn_pilgrims','krn_travel_groups','krn_packages','krn_bookings','krn_tickets','krn_visa_cases','krn_suppliers'] loop execute format('drop policy if exists staff_insert on public.%I',t);execute format('create policy staff_insert on public.%I for insert to authenticated with check (public.krn_staff_role() in (''admin'',''manager'',''finance'',''visa'',''sales''))',t);execute format('drop policy if exists staff_update on public.%I',t);execute format('create policy staff_update on public.%I for update to authenticated using (public.krn_staff_role() in (''admin'',''manager'')) with check (public.krn_staff_role() in (''admin'',''manager''))',t);end loop;end$$;
drop policy if exists finance_insert on public.krn_ledger_entries;
create policy finance_insert on public.krn_ledger_entries for insert to authenticated with check(public.krn_staff_role() in ('admin','finance') and created_by=auth.uid());
drop policy if exists admin_staff_insert on public.krn_staff_profiles;
create policy admin_staff_insert on public.krn_staff_profiles for insert to authenticated with check(public.krn_staff_role()='admin');
drop policy if exists admin_staff_update on public.krn_staff_profiles;
create policy admin_staff_update on public.krn_staff_profiles for update to authenticated using(public.krn_staff_role()='admin') with check(public.krn_staff_role()='admin');
-- Never expose service_role to the browser. Ledger and audit entries are append-only in this starter.
