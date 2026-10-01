-- Run after schema.sql, finance_v1.sql and booking_v1.sql.
alter table public.krn_pilgrims add column if not exists father_name text;
alter table public.krn_pilgrims add column if not exists national_id text;
alter table public.krn_pilgrims add column if not exists passport_issue date;
alter table public.krn_pilgrims add column if not exists address text;
alter table public.krn_pilgrims add column if not exists email text;
alter table public.krn_pilgrims add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

alter table public.krn_agents add column if not exists father_name text;
alter table public.krn_agents add column if not exists national_id text;
alter table public.krn_agents add column if not exists nationality text;
alter table public.krn_agents add column if not exists date_of_birth date;
alter table public.krn_agents add column if not exists passport_number text;
alter table public.krn_agents add column if not exists passport_issue date;
alter table public.krn_agents add column if not exists passport_expiry date;
alter table public.krn_agents add column if not exists address text;
alter table public.krn_agents add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

drop policy if exists pilgrim_self_read on public.krn_pilgrims;
create policy pilgrim_self_read on public.krn_pilgrims for select to authenticated using(auth_user_id=auth.uid());
drop policy if exists agent_self_read on public.krn_agents;
create policy agent_self_read on public.krn_agents for select to authenticated using(auth_user_id=auth.uid());
drop policy if exists agent_pilgrim_read on public.krn_pilgrims;
create policy agent_pilgrim_read on public.krn_pilgrims for select to authenticated using
 (exists(select 1 from public.krn_agents a where a.id=agent_id and a.auth_user_id=auth.uid()));
drop policy if exists pilgrim_booking_read on public.krn_bookings;
create policy pilgrim_booking_read on public.krn_bookings for select to authenticated using
 (exists(select 1 from public.krn_pilgrims p where p.id=pilgrim_id and p.auth_user_id=auth.uid()));
drop policy if exists agent_booking_read on public.krn_bookings;
create policy agent_booking_read on public.krn_bookings for select to authenticated using
 (exists(select 1 from public.krn_pilgrims p join public.krn_agents a on a.id=p.agent_id where p.id=pilgrim_id and a.auth_user_id=auth.uid()));
drop policy if exists pilgrim_visa_read on public.krn_visa_cases;
create policy pilgrim_visa_read on public.krn_visa_cases for select to authenticated using
 (exists(select 1 from public.krn_pilgrims p where p.id=pilgrim_id and p.auth_user_id=auth.uid()));
drop policy if exists pilgrim_ticket_read on public.krn_tickets;
create policy pilgrim_ticket_read on public.krn_tickets for select to authenticated using
 (exists(select 1 from public.krn_bookings b join public.krn_pilgrims p on p.id=b.pilgrim_id where b.id=booking_id and p.auth_user_id=auth.uid()));
drop policy if exists agent_visa_read on public.krn_visa_cases;
create policy agent_visa_read on public.krn_visa_cases for select to authenticated using
 (exists(select 1 from public.krn_pilgrims p join public.krn_agents a on a.id=p.agent_id where p.id=pilgrim_id and a.auth_user_id=auth.uid()));
drop policy if exists agent_ticket_read on public.krn_tickets;
create policy agent_ticket_read on public.krn_tickets for select to authenticated using
 (exists(select 1 from public.krn_bookings b join public.krn_pilgrims p on p.id=b.pilgrim_id join public.krn_agents a on a.id=p.agent_id where b.id=booking_id and a.auth_user_id=auth.uid()));

-- Financial row access is by the linked party only; writes remain staff-only.
drop policy if exists party_finance_read on public.krn_finance_entries;
create policy party_finance_read on public.krn_finance_entries for select to authenticated using
 ((party_type='pilgrim' and exists(select 1 from public.krn_pilgrims p where p.id=party_id and p.auth_user_id=auth.uid()))
  or (party_type='agent' and exists(select 1 from public.krn_agents a where a.id=party_id and a.auth_user_id=auth.uid())));

-- Portal users see public package details only, never internal cost_price.
create or replace function public.krn_portal_packages()
returns table(id uuid,name text,destinations text,duration_days integer,selling_price numeric)
language sql stable security definer set search_path=public as $$
 select p.id,p.name,p.destinations,p.duration_days,p.selling_price
 from public.krn_packages p where p.status='active' order by p.name;
$$;
revoke all on function public.krn_portal_packages() from public, anon;
grant execute on function public.krn_portal_packages() to authenticated;

create or replace function public.krn_portal_create_booking(p_pilgrim uuid,p_package uuid)
returns text language plpgsql security definer set search_path=public as $$
declare price numeric; reference text;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if not exists(select 1 from public.krn_pilgrims p where p.id=p_pilgrim
       and (p.auth_user_id=auth.uid() or exists
         (select 1 from public.krn_agents a where a.id=p.agent_id and a.auth_user_id=auth.uid()))) then
   raise exception 'Pilgrim is not linked to your portal';
 end if;
 select p.selling_price into price from public.krn_packages p where p.id=p_package and p.status='active';
 if price is null then raise exception 'Select an active package'; end if;
 insert into public.krn_bookings(pilgrim_id,package_id,total_amount,status)
 values(p_pilgrim,p_package,price,'enquiry') returning booking_reference into reference;
 return reference;
end;$$;
revoke all on function public.krn_portal_create_booking(uuid,uuid) from public, anon;
grant execute on function public.krn_portal_create_booking(uuid,uuid) to authenticated;

select 'portal_ready' as result;
