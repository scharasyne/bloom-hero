alter table public.users
add column if not exists profile_photo_url text;

alter table public.vendors
add column if not exists location_text text,
add column if not exists location_latitude double precision,
add column if not exists location_longitude double precision,
add column if not exists phone_number text,
add column if not exists opens_at time without time zone,
add column if not exists closes_at time without time zone,
add column if not exists about text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vendors_phone_number_ph_check'
  ) then
    alter table public.vendors
    add constraint vendors_phone_number_ph_check
    check (phone_number is null or phone_number ~ '^\+63\d{9}$');
  end if;
end
$$;

create index if not exists idx_vendors_location_text
on public.vendors using gin (to_tsvector('simple', coalesce(location_text, '')));

create index if not exists idx_vendors_location_coords
on public.vendors (location_latitude, location_longitude);
