-- Run after pricing_v1.sql. Additive; old records keep their existing totals.
begin;
alter table public.krn_bookings add column if not exists quantity integer not null default 1 check(quantity>0);
alter table public.krn_bookings add column if not exists unit_price_pkr numeric(14,2) not null default 0;
alter table public.krn_bookings add column if not exists agent_id uuid references public.krn_agents(id);
alter table public.krn_bookings add column if not exists booking_kind text not null default 'package' check(booking_kind in ('package','visa','ticket'));
alter table public.krn_bookings add column if not exists countries text[] not null default '{}';
alter table public.krn_bookings add column if not exists origin text;
alter table public.krn_bookings add column if not exists destination text;
alter table public.krn_bookings add column if not exists airline text;
alter table public.krn_bookings add column if not exists flight_number text;
alter table public.krn_visa_cases add column if not exists quantity integer not null default 1 check(quantity>0);
alter table public.krn_visa_cases add column if not exists countries text[] not null default '{}';
alter table public.krn_visa_cases add column if not exists sale_unit_pkr numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists cost_unit_pkr numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists agent_id uuid references public.krn_agents(id);
alter table public.krn_visa_cases add column if not exists bill_to text not null default 'pilgrim' check(bill_to in ('pilgrim','agent'));
alter table public.krn_tickets add column if not exists quantity integer not null default 1 check(quantity>0);
alter table public.krn_tickets add column if not exists pilgrim_id uuid references public.krn_pilgrims(id);
alter table public.krn_tickets add column if not exists agent_id uuid references public.krn_agents(id);
alter table public.krn_tickets add column if not exists bill_to text not null default 'pilgrim' check(bill_to in ('pilgrim','agent'));
alter table public.krn_tickets add column if not exists origin text;
alter table public.krn_tickets add column if not exists destination text;
alter table public.krn_tickets add column if not exists flight_number text;
alter table public.krn_tickets add column if not exists sale_unit_pkr numeric(14,2) not null default 0;
alter table public.krn_tickets add column if not exists cost_unit_pkr numeric(14,2) not null default 0;

create or replace function public.krn_price_before_write() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if TG_TABLE_NAME='krn_bookings' then
   if TG_OP='UPDATE' then
     if (new.sale_usd,new.usd_rate,new.total_amount,new.pilgrim_id,new.bill_to,new.agent_id,new.quantity,new.unit_price_pkr,new.booking_kind,new.countries,new.origin,new.destination,new.airline,new.flight_number) is distinct from
        (old.sale_usd,old.usd_rate,old.total_amount,old.pilgrim_id,old.bill_to,old.agent_id,old.quantity,old.unit_price_pkr,old.booking_kind,old.countries,old.origin,old.destination,old.airline,old.flight_number) then
       raise exception 'Booking and financial fields are locked. Reverse the invoice and create a corrected booking';
     end if;
   end if;
   if new.agent_id is null and TG_OP='INSERT' then
     new.agent_id:=(select agent_id from public.krn_pilgrims where id=new.pilgrim_id);
   end if;
   if new.sale_usd<0 or new.usd_rate<0 or new.unit_price_pkr<0 or new.quantity<1 then raise exception 'Invalid booking quantity or price'; end if;
   if new.sale_usd>0 then
     if new.usd_rate<=0 then raise exception 'Enter a positive USD to PKR rate'; end if;
     new.total_amount:=round(new.quantity*new.sale_usd*new.usd_rate,2);
   elsif new.unit_price_pkr>0 then
     new.total_amount:=round(new.quantity*new.unit_price_pkr,2);
   end if;
   if new.bill_to='agent' and new.agent_id is null then raise exception 'Select an agent before billing that agent'; end if;
   if new.booking_kind='visa' and cardinality(new.countries)=0 then raise exception 'Select at least one visa country'; end if;
   if new.booking_kind='ticket' and (nullif(trim(coalesce(new.origin,'')),'') is null or nullif(trim(coalesce(new.destination,'')),'') is null or nullif(trim(coalesce(new.airline,'')),'') is null or nullif(trim(coalesce(new.flight_number,'')),'') is null) then
     raise exception 'Enter ticket origin, destination, airline and flight number';
   end if;
 else
   if TG_OP='UPDATE' then
     if (new.sale_usd,new.usd_rate,new.sale_amount,new.cost_usd,new.cost_rate,new.cost_amount,new.supplier_id,new.bill_separately,new.booking_id,new.quantity,new.sale_unit_pkr,new.cost_unit_pkr,new.agent_id,new.bill_to) is distinct from
        (old.sale_usd,old.usd_rate,old.sale_amount,old.cost_usd,old.cost_rate,old.cost_amount,old.supplier_id,old.bill_separately,old.booking_id,old.quantity,old.sale_unit_pkr,old.cost_unit_pkr,old.agent_id,old.bill_to) then
       raise exception 'Financial fields are locked. Reverse the bill and create a corrected record';
     end if;
     if TG_TABLE_NAME='krn_visa_cases' then
       if (new.pilgrim_id,new.country,new.countries) is distinct from (old.pilgrim_id,old.country,old.countries) then raise exception 'Visa country and pilgrim are locked'; end if;
     else
       if (new.pilgrim_id,new.origin,new.destination,new.flight_number,new.airline) is distinct from (old.pilgrim_id,old.origin,old.destination,old.flight_number,old.airline) then raise exception 'Ticket route, traveller and flight are locked'; end if;
     end if;
   end if;
   if new.sale_usd<0 or new.usd_rate<0 or new.cost_usd<0 or new.cost_rate<0 or new.sale_unit_pkr<0 or new.cost_unit_pkr<0 or new.quantity<1 then raise exception 'Invalid quantity or price'; end if;
   if new.sale_usd>0 then
     if new.usd_rate<=0 then raise exception 'Enter a positive sale exchange rate'; end if;
     new.sale_amount:=round(new.quantity*new.sale_usd*new.usd_rate,2);
   elsif new.sale_unit_pkr>0 then new.sale_amount:=round(new.quantity*new.sale_unit_pkr,2);
   end if;
   if new.cost_usd>0 then
     if new.cost_rate<=0 then raise exception 'Enter a positive supplier exchange rate'; end if;
     new.cost_amount:=round(new.quantity*new.cost_usd*new.cost_rate,2);
   elsif new.cost_unit_pkr>0 then new.cost_amount:=round(new.quantity*new.cost_unit_pkr,2);
   end if;
   if new.cost_amount>0 and new.supplier_id is null then raise exception 'Select an airline, embassy or company for the supplier cost'; end if;
   if TG_OP='INSERT' then
     if TG_TABLE_NAME='krn_tickets' and new.booking_id is not null then
       if new.pilgrim_id is null then new.pilgrim_id:=(select pilgrim_id from public.krn_bookings where id=new.booking_id); end if;
     end if;
     if new.agent_id is null then new.agent_id:=(select agent_id from public.krn_pilgrims where id=new.pilgrim_id); end if;
   end if;
   if new.booking_id is not null and not exists(select 1 from public.krn_bookings b where b.id=new.booking_id and b.pilgrim_id=new.pilgrim_id) then raise exception 'Booking belongs to another pilgrim'; end if;
   if new.bill_to='agent' and new.agent_id is null then raise exception 'Select an agent before billing that agent'; end if;
   if TG_TABLE_NAME='krn_visa_cases' then
     if cardinality(new.countries)=0 then new.countries:=array[new.country]; end if;
     if cardinality(new.countries)=0 then raise exception 'Select at least one visa country'; end if;
   end if;
 end if;
 return new;
end$$;

-- Group occupancy counts travellers/tickets, not just booking rows.
create or replace function public.krn_booking_guard() returns trigger
language plpgsql security definer set search_path=public as $$
declare cap integer; used integer;
begin
 if TG_OP='INSERT' and nullif(trim(coalesce(new.booking_reference,'')),'') is null then
   new.booking_reference:='KN-'||to_char(current_date,'YYYYMMDD')||'-'||lpad(nextval('public.krn_booking_number_seq')::text,6,'0');
 end if;
 if new.group_id is not null and new.status in ('confirmed','in_process','completed') then
   select capacity into cap from public.krn_travel_groups where id=new.group_id for update;
   if not found then raise exception 'Travel group does not exist'; end if;
   if cap is not null then
     select coalesce(sum(quantity),0)::integer into used from public.krn_bookings
     where group_id=new.group_id and status in ('confirmed','in_process','completed') and id is distinct from new.id;
     if used+new.quantity>cap then raise exception 'Travel group has insufficient seats'; end if;
   end if;
 end if;
 return new;
end$$;

-- Allow booking-level agent assignment in the existing ledger validator.
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
    if new.party_type='agent' and not exists(select 1 from public.krn_bookings b join public.krn_pilgrims p on p.id=b.pilgrim_id where b.id=new.booking_id and (p.agent_id=new.party_id or b.agent_id=new.party_id)) then
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

create or replace function public.krn_post_document_charges() returns trigger
language plpgsql security definer set search_path=public as $$
declare p_id uuid; b_id uuid; label text; charged_to text:='pilgrim';
begin
 if TG_TABLE_NAME='krn_bookings' then
   p_id:=new.pilgrim_id;b_id:=new.id;
   label:='Booking '||new.booking_reference||' · '||new.booking_kind||' · Qty '||new.quantity;
   if new.booking_kind='visa' then label:=label||' · '||array_to_string(new.countries,', '); end if;
   if new.booking_kind='ticket' then label:=label||' · '||new.origin||' to '||new.destination||' · '||new.airline||' '||new.flight_number; end if;
   if new.bill_to='agent' then p_id:=new.agent_id;charged_to:='agent'; end if;
   if new.total_amount>0 then
     insert into public.krn_finance_entries(entry_type,party_type,party_id,booking_id,amount,description,source_kind,source_id)
     values('invoice',charged_to,p_id,b_id,new.total_amount,label,'booking',new.id);
   end if;
 else
   if TG_TABLE_NAME='krn_visa_cases' then
     p_id:=new.pilgrim_id;label:='Visa '||array_to_string(new.countries,', ')||' · Qty '||new.quantity;
   else
     p_id:=new.pilgrim_id;
     label:='Ticket '||coalesce(new.ticket_number,new.pnr,new.passenger_name)||' · '||coalesce(new.origin,'?')||' to '||coalesce(new.destination,'?')||' · '||coalesce(new.flight_number,'?')||' · Qty '||new.quantity;
   end if;
   b_id:=new.booking_id;
   if new.bill_separately and new.sale_amount>0 then
     if p_id is null then raise exception 'Select a pilgrim before billing a ticket'; end if;
     if b_id is not null and exists(select 1 from public.krn_bookings where id=b_id and bill_to='agent') then
       select agent_id into p_id from public.krn_bookings where id=b_id;charged_to:='agent';
     elsif b_id is null and new.bill_to='agent' then
       p_id:=new.agent_id;charged_to:='agent';
     end if;
     insert into public.krn_finance_entries(entry_type,party_type,party_id,booking_id,amount,description,source_kind,source_id)
     values('invoice',charged_to,p_id,b_id,new.sale_amount,label,'customer_'||TG_TABLE_NAME,new.id);
   end if;
   if new.cost_amount>0 then
     insert into public.krn_finance_entries(entry_type,party_type,party_id,booking_id,amount,description,source_kind,source_id)
     values('supplier_bill','supplier',new.supplier_id,b_id,new.cost_amount,label,'supplier_'||TG_TABLE_NAME,new.id);
   end if;
 end if;
 return new;
end$$;
drop policy if exists direct_ticket_pilgrim_read on public.krn_tickets;
create policy direct_ticket_pilgrim_read on public.krn_tickets for select to authenticated using
 (exists(select 1 from public.krn_pilgrims p where p.id=pilgrim_id and p.auth_user_id=auth.uid()));
drop policy if exists direct_ticket_agent_read on public.krn_tickets;
create policy direct_ticket_agent_read on public.krn_tickets for select to authenticated using
 (exists(select 1 from public.krn_agents a where a.id=agent_id and a.auth_user_id=auth.uid()));
drop policy if exists assigned_booking_agent_read on public.krn_bookings;
create policy assigned_booking_agent_read on public.krn_bookings for select to authenticated using
 (exists(select 1 from public.krn_agents a where a.id=agent_id and a.auth_user_id=auth.uid()));
create or replace function public.krn_agent_can_read_pilgrim(p_pilgrim uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.krn_bookings b join public.krn_agents a on a.id=b.agent_id
               where b.pilgrim_id=p_pilgrim and a.auth_user_id=auth.uid());
$$;
revoke all on function public.krn_agent_can_read_pilgrim(uuid) from public, anon;
grant execute on function public.krn_agent_can_read_pilgrim(uuid) to authenticated;
drop policy if exists assigned_pilgrim_agent_read on public.krn_pilgrims;
create policy assigned_pilgrim_agent_read on public.krn_pilgrims for select to authenticated using
 (public.krn_agent_can_read_pilgrim(id));
drop policy if exists direct_visa_agent_read on public.krn_visa_cases;
create policy direct_visa_agent_read on public.krn_visa_cases for select to authenticated using
 (exists(select 1 from public.krn_agents a where a.id=agent_id and a.auth_user_id=auth.uid()));
create or replace function public.krn_portal_create_booking_quantity(p_pilgrim uuid,p_package uuid,p_quantity integer)
returns text language plpgsql security definer set search_path=public as $$
declare unit_price numeric; reference text; bill_party text:='pilgrim'; selected_agent uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>200 then raise exception 'Quantity must be between 1 and 200'; end if;
 if not exists(select 1 from public.krn_pilgrims p where p.id=p_pilgrim
       and (p.auth_user_id=auth.uid() or exists
         (select 1 from public.krn_agents a where a.id=p.agent_id and a.auth_user_id=auth.uid()))) then
   raise exception 'Pilgrim is not linked to your portal';
 end if;
 select p.agent_id into selected_agent from public.krn_pilgrims p where p.id=p_pilgrim;
 if exists(select 1 from public.krn_agents a where a.id=selected_agent and a.auth_user_id=auth.uid()) then bill_party:='agent'; end if;
 select p.selling_price into unit_price from public.krn_packages p where p.id=p_package and p.status='active';
 if unit_price is null then raise exception 'Select an active package'; end if;
 insert into public.krn_bookings(pilgrim_id,agent_id,package_id,quantity,unit_price_pkr,total_amount,status,bill_to,booking_kind)
 values(p_pilgrim,selected_agent,p_package,p_quantity,unit_price,p_quantity*unit_price,'enquiry',bill_party,'package')
 returning booking_reference into reference;
 return reference;
end$$;
revoke all on function public.krn_portal_create_booking_quantity(uuid,uuid,integer) from public, anon;
grant execute on function public.krn_portal_create_booking_quantity(uuid,uuid,integer) to authenticated;
select 'quantity_ready' as result;
commit;
