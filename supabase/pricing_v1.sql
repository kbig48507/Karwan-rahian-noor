-- Run after schema.sql, finance_v1.sql, booking_v1.sql and portal_v1.sql.
-- Adds prices to future records; no historical bills are created.
alter table public.krn_bookings add column if not exists sale_usd numeric(14,2) not null default 0;
alter table public.krn_bookings add column if not exists usd_rate numeric(14,4) not null default 0;
alter table public.krn_bookings add column if not exists bill_to text not null default 'pilgrim' check(bill_to in ('pilgrim','agent'));
alter table public.krn_visa_cases add column if not exists sale_usd numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists usd_rate numeric(14,4) not null default 0;
alter table public.krn_visa_cases add column if not exists sale_amount numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists cost_usd numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists cost_rate numeric(14,4) not null default 0;
alter table public.krn_visa_cases add column if not exists cost_amount numeric(14,2) not null default 0;
alter table public.krn_visa_cases add column if not exists supplier_id uuid references public.krn_suppliers(id);
alter table public.krn_visa_cases add column if not exists bill_separately boolean not null default false;
alter table public.krn_tickets add column if not exists sale_usd numeric(14,2) not null default 0;
alter table public.krn_tickets add column if not exists usd_rate numeric(14,4) not null default 0;
alter table public.krn_tickets add column if not exists sale_amount numeric(14,2) not null default 0;
alter table public.krn_tickets add column if not exists cost_usd numeric(14,2) not null default 0;
alter table public.krn_tickets add column if not exists cost_rate numeric(14,4) not null default 0;
alter table public.krn_tickets add column if not exists supplier_id uuid references public.krn_suppliers(id);
alter table public.krn_tickets add column if not exists bill_separately boolean not null default false;
alter table public.krn_finance_entries add column if not exists source_kind text;
alter table public.krn_finance_entries add column if not exists source_id uuid;
create unique index if not exists krn_finance_source_once on public.krn_finance_entries(source_kind,source_id,entry_type)
 where source_kind is not null and reversal_of is null;

create or replace function public.krn_price_before_write() returns trigger
language plpgsql security definer set search_path=public as $$
declare sale numeric; cost numeric;
begin
 if TG_TABLE_NAME='krn_bookings' then
   if TG_OP='UPDATE' then
     if (new.sale_usd,new.usd_rate,new.total_amount,new.pilgrim_id,new.bill_to) is distinct from
        (old.sale_usd,old.usd_rate,old.total_amount,old.pilgrim_id,old.bill_to) then
       raise exception 'Financial booking fields are locked. Reverse the invoice and create a corrected record';
     end if;
   end if;
   if new.sale_usd<0 or new.usd_rate<0 then raise exception 'Dollar amount and rate cannot be negative'; end if;
   if new.sale_usd>0 then
     if new.usd_rate<=0 then raise exception 'Enter a positive USD to PKR rate'; end if;
     new.total_amount:=round(new.sale_usd*new.usd_rate,2);
   end if;
   if new.bill_to='agent' and not exists(select 1 from public.krn_pilgrims p where p.id=new.pilgrim_id and p.agent_id is not null) then
     raise exception 'Assign the pilgrim to an agent before billing that agent';
   end if;
 else
   if TG_OP='UPDATE' then
     if (new.sale_usd,new.usd_rate,new.sale_amount,new.cost_usd,new.cost_rate,new.cost_amount,new.supplier_id,new.bill_separately,new.booking_id) is distinct from
        (old.sale_usd,old.usd_rate,old.sale_amount,old.cost_usd,old.cost_rate,old.cost_amount,old.supplier_id,old.bill_separately,old.booking_id) then
       raise exception 'Financial fields are locked. Reverse the bill and create a corrected record';
     end if;
   end if;
   if new.sale_usd<0 or new.usd_rate<0 or new.cost_usd<0 or new.cost_rate<0 then raise exception 'Dollar amounts and rates cannot be negative'; end if;
   if new.sale_usd>0 then
     if new.usd_rate<=0 then raise exception 'Enter a positive sale exchange rate'; end if;
     new.sale_amount:=round(new.sale_usd*new.usd_rate,2);
   end if;
   if new.cost_usd>0 then
     if new.cost_rate<=0 then raise exception 'Enter a positive supplier exchange rate'; end if;
     new.cost_amount:=round(new.cost_usd*new.cost_rate,2);
   end if;
   if new.cost_amount>0 and new.supplier_id is null then raise exception 'Select an airline, embassy or company for the supplier cost'; end if;
   if TG_TABLE_NAME='krn_visa_cases' and TG_OP='UPDATE' then
     if new.pilgrim_id is distinct from old.pilgrim_id then
       raise exception 'Pilgrim is locked after case creation';
     end if;
   end if;
 end if;
 return new;
end$$;
drop trigger if exists krn_booking_price_write on public.krn_bookings;
create trigger krn_booking_price_write before insert or update on public.krn_bookings
for each row execute function public.krn_price_before_write();
drop trigger if exists krn_visa_price_write on public.krn_visa_cases;
create trigger krn_visa_price_write before insert or update on public.krn_visa_cases
for each row execute function public.krn_price_before_write();
drop trigger if exists krn_ticket_price_write on public.krn_tickets;
create trigger krn_ticket_price_write before insert or update on public.krn_tickets
for each row execute function public.krn_price_before_write();

create or replace function public.krn_post_document_charges() returns trigger
language plpgsql security definer set search_path=public as $$
declare p_id uuid; b_id uuid; label text; charged_to text:='pilgrim';
begin
 if TG_TABLE_NAME='krn_bookings' then
   p_id:=new.pilgrim_id;b_id:=new.id;label:='Booking '||new.booking_reference;
   if new.bill_to='agent' then
     select agent_id into p_id from public.krn_pilgrims where id=new.pilgrim_id;
     charged_to:='agent';
   end if;
   if new.total_amount>0 then
     insert into public.krn_finance_entries(entry_type,party_type,party_id,booking_id,amount,description,source_kind,source_id)
     values('invoice',charged_to,p_id,b_id,new.total_amount,label,'booking',new.id);
   end if;
 else
   if TG_TABLE_NAME='krn_visa_cases' then
     p_id:=new.pilgrim_id;label:='Visa '||new.country;
   else
     select pilgrim_id into p_id from public.krn_bookings where id=new.booking_id;
     label:='Airline ticket '||coalesce(new.ticket_number,new.pnr,new.passenger_name);
   end if;
   b_id:=new.booking_id;
   if new.bill_separately and new.sale_amount>0 then
     if p_id is null then raise exception 'Link a booking before billing a ticket to a pilgrim'; end if;
     if b_id is not null and exists(select 1 from public.krn_bookings where id=b_id and bill_to='agent') then
       select agent_id into p_id from public.krn_pilgrims where id=p_id;
       charged_to:='agent';
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
drop trigger if exists krn_booking_post_charges on public.krn_bookings;
create trigger krn_booking_post_charges after insert on public.krn_bookings
for each row execute function public.krn_post_document_charges();
drop trigger if exists krn_visa_post_charges on public.krn_visa_cases;
create trigger krn_visa_post_charges after insert on public.krn_visa_cases
for each row execute function public.krn_post_document_charges();
drop trigger if exists krn_ticket_post_charges on public.krn_tickets;
create trigger krn_ticket_post_charges after insert on public.krn_tickets
for each row execute function public.krn_post_document_charges();

create or replace function public.krn_portal_create_booking(p_pilgrim uuid,p_package uuid)
returns text language plpgsql security definer set search_path=public as $$
declare price numeric; reference text; bill_party text:='pilgrim';
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if not exists(select 1 from public.krn_pilgrims p where p.id=p_pilgrim
       and (p.auth_user_id=auth.uid() or exists
         (select 1 from public.krn_agents a where a.id=p.agent_id and a.auth_user_id=auth.uid()))) then
   raise exception 'Pilgrim is not linked to your portal';
 end if;
 if exists(select 1 from public.krn_pilgrims p join public.krn_agents a on a.id=p.agent_id
           where p.id=p_pilgrim and a.auth_user_id=auth.uid()) then bill_party:='agent'; end if;
 select p.selling_price into price from public.krn_packages p where p.id=p_package and p.status='active';
 if price is null then raise exception 'Select an active package'; end if;
 insert into public.krn_bookings(pilgrim_id,package_id,total_amount,status,bill_to)
 values(p_pilgrim,p_package,price,'enquiry',bill_party) returning booking_reference into reference;
 return reference;
end;$$;
revoke all on function public.krn_portal_create_booking(uuid,uuid) from public, anon;
grant execute on function public.krn_portal_create_booking(uuid,uuid) to authenticated;

select 'pricing_ready' as result;
