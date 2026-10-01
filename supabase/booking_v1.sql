-- Booking workflow upgrade. Run after schema.sql; safe for existing records.
create sequence if not exists public.krn_booking_number_seq;
create or replace function public.krn_booking_guard() returns trigger
language plpgsql security definer set search_path=public as $$
declare cap integer; used integer;
begin
  if TG_OP='INSERT' and nullif(trim(coalesce(new.booking_reference,'')),'') is null then
    new.booking_reference := 'KN-'||to_char(current_date,'YYYYMMDD')||'-'||lpad(nextval('public.krn_booking_number_seq')::text,6,'0');
  end if;
  if new.group_id is not null and new.status in ('confirmed','in_process','completed') then
    select capacity into cap from public.krn_travel_groups where id=new.group_id for update;
    if not found then raise exception 'Travel group does not exist'; end if;
    if cap is not null then
      select count(*) into used from public.krn_bookings
      where group_id=new.group_id and status in ('confirmed','in_process','completed') and id is distinct from new.id;
      if used >= cap then raise exception 'Travel group is full'; end if;
    end if;
  end if;
  return new;
end$$;
drop trigger if exists krn_booking_guard_write on public.krn_bookings;
create trigger krn_booking_guard_write before insert or update of group_id,status on public.krn_bookings
for each row execute function public.krn_booking_guard();
create index if not exists krn_bookings_group_status_idx on public.krn_bookings(group_id,status);
create index if not exists krn_bookings_pilgrim_idx on public.krn_bookings(pilgrim_id);
select 'booking_ready' as status, to_regclass('public.krn_bookings') as table_name;
