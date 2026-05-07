alter table public.popup_location_requests
add column if not exists created_at timestamp with time zone not null default now(),
add column if not exists requested_start_time time without time zone,
add column if not exists requested_end_time time without time zone,
add column if not exists latitude double precision,
add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'popup_location_requests_time_range_check'
  ) then
    alter table public.popup_location_requests
    add constraint popup_location_requests_time_range_check
    check (
      requested_start_time is null
      or requested_end_time is null
      or requested_start_time < requested_end_time
    );
  end if;
end
$$;
