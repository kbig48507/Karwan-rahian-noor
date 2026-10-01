-- Karwan Rahiyaan Noor finance module (run once after schema.sql).
-- This adds new tables only; it does not change or delete earlier records.
create table if not exists public.krn_finance_entries (
  id bigint generated always as identity primary key,
  entry_date date not null default current_date,
  entry_type text not null check (entry_type in ('opening','invoice','supplier_bill','receipt','payment','refund')),
  party_type text check (party_type in ('pilgrim','agent','supplier')),
  party_id uuid,
  booking_id uuid references public.krn_bookings(id),
  bill_id bigint references public.krn_finance_entries(id),
  method text check (method in ('cash','bank')),
  amount numeric(14,2) not null check (amount > 0),
  reference text,
  description text,
  reversal_of bigint unique references public.krn_finance_entries(id),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  check ((entry_type='opening' and party_type is null and party_id is null and booking_id is null and bill_id is null)
      or (entry_type<>'opening' and party_type is not null and party_id is not null)),
  check ((entry_type in ('opening','receipt','payment','refund') and method is not null)
      or (entry_type in ('invoice','supplier_bill') and method is null)),
  check (bill_id is null or entry_type in ('receipt','payment'))
);
create index if not exists krn_finance_date_idx on public.krn_finance_entries(entry_date,id);
create index if not exists krn_finance_party_idx on public.krn_finance_entries(party_type,party_id,id);
create index if not exists krn_finance_bill_idx on public.krn_finance_entries(bill_id);

create or replace function public.krn_finance_validate() returns trigger
language plpgsql security definer set search_path=public as $$
declare original public.krn_finance_entries%rowtype; bill public.krn_finance_entries%rowtype;
begin
  if new.entry_type='opening' then
    if public.krn_staff_role() <> 'admin' then raise exception 'Only an admin may post an opening balance'; end if;
  else
    if (new.party_type='pilgrim' and not exists(select 1 from public.krn_pilgrims where id=new.party_id))
      or (new.party_type='agent' and not exists(select 1 from public.krn_agents where id=new.party_id))
      or (new.party_type='supplier' and not exists(select 1 from public.krn_suppliers where id=new.party_id)) then
      raise exception 'Party does not exist';
    end if;
    if (new.entry_type in ('invoice','receipt','refund') and new.party_type not in ('pilgrim','agent'))
      or (new.entry_type in ('supplier_bill','payment') and new.party_type <> 'supplier') then
      raise exception 'Entry type and party type do not match';
    end if;
  end if;
  if new.booking_id is not null then
    if new.party_type='pilgrim' and not exists(select 1 from public.krn_bookings where id=new.booking_id and pilgrim_id=new.party_id) then
      raise exception 'Booking belongs to another pilgrim';
    end if;
    if new.party_type='agent' and not exists(select 1 from public.krn_bookings b join public.krn_pilgrims p on p.id=b.pilgrim_id where b.id=new.booking_id and p.agent_id=new.party_id) then
      raise exception 'Booking is not assigned to this agent';
    end if;
    if new.party_type='supplier' and not exists(select 1 from public.krn_bookings where id=new.booking_id) then
      raise exception 'Booking does not exist';
    end if;
  end if;
  if new.bill_id is not null and new.reversal_of is null then
    select * into bill from public.krn_finance_entries where id=new.bill_id for update;
    if not found or bill.reversal_of is not null or exists(select 1 from public.krn_finance_entries where reversal_of=bill.id)
      or bill.party_type is distinct from new.party_type or bill.party_id is distinct from new.party_id
      or (new.entry_type='receipt' and bill.entry_type<>'invoice')
      or (new.entry_type='payment' and bill.entry_type<>'supplier_bill') then
      raise exception 'Selected bill does not match this transaction';
    end if;
    if new.amount > bill.amount - coalesce((select sum(case when a.reversal_of is null then a.amount else -a.amount end) from public.krn_finance_entries a where a.bill_id=bill.id),0) then
      raise exception 'Amount exceeds the remaining bill balance';
    end if;
  end if;
  if new.reversal_of is not null then
    select * into original from public.krn_finance_entries where id=new.reversal_of;
    if not found or original.reversal_of is not null
      or original.entry_type is distinct from new.entry_type
      or original.party_type is distinct from new.party_type
      or original.party_id is distinct from new.party_id
      or original.booking_id is distinct from new.booking_id
      or original.bill_id is distinct from new.bill_id
      or original.method is distinct from new.method
      or original.amount is distinct from new.amount
      or nullif(trim(coalesce(new.description,'')),'') is null then
      raise exception 'Reversal must exactly match the original and include a reason';
    end if;
    if original.entry_type in ('invoice','supplier_bill') and exists (
      select 1 from public.krn_finance_entries a
      where a.bill_id=original.id and a.reversal_of is null
        and not exists(select 1 from public.krn_finance_entries r where r.reversal_of=a.id)
    ) then raise exception 'Reverse linked receipts or payments first'; end if;
  end if;
  return new;
end$$;
drop trigger if exists krn_finance_validate_insert on public.krn_finance_entries;
create trigger krn_finance_validate_insert before insert on public.krn_finance_entries
for each row execute function public.krn_finance_validate();

alter table public.krn_finance_entries enable row level security;
drop policy if exists krn_finance_read on public.krn_finance_entries;
create policy krn_finance_read on public.krn_finance_entries for select to authenticated
using (public.krn_staff_role() in ('admin','manager','finance','viewer'));
drop policy if exists krn_finance_insert on public.krn_finance_entries;
create policy krn_finance_insert on public.krn_finance_entries for insert to authenticated
with check (public.krn_staff_role() in ('admin','finance') and created_by=auth.uid());
-- No UPDATE or DELETE policy. Correct mistakes with an equal and opposite reversal.
select 'finance_ready' as status, to_regclass('public.krn_finance_entries') as table_name;
