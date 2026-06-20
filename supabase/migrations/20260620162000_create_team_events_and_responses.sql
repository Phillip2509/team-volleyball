create table if not exists public.team_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  event_type text not null,
  title text not null,
  description text null,
  location text null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  response_deadline timestamptz null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_events_type_check check (event_type in ('training', 'match', 'team_event')),
  constraint team_events_status_check check (status in ('scheduled', 'cancelled')),
  constraint team_events_title_length check (char_length(btrim(title)) between 2 and 100),
  constraint team_events_ends_after_start check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.event_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.team_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response text not null,
  note text null,
  responded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_responses_event_user_unique unique (event_id, user_id),
  constraint event_responses_value_check check (response in ('accepted', 'maybe', 'declined')),
  constraint event_responses_note_length check (note is null or char_length(note) <= 300)
);

create index if not exists team_events_team_id_idx on public.team_events(team_id);
create index if not exists team_events_starts_at_idx on public.team_events(starts_at);
create index if not exists team_events_team_starts_at_idx on public.team_events(team_id, starts_at);
create index if not exists event_responses_event_id_idx on public.event_responses(event_id);
create index if not exists event_responses_user_id_idx on public.event_responses(user_id);

drop trigger if exists team_events_set_updated_at on public.team_events;
create trigger team_events_set_updated_at
before update on public.team_events
for each row execute function public.set_updated_at();

drop trigger if exists event_responses_set_updated_at on public.event_responses;
create trigger event_responses_set_updated_at
before update on public.event_responses
for each row execute function public.set_updated_at();

create or replace function public.is_team_coach_or_admin(input_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tm.role in ('coach', 'admin')
  );
$$;

create or replace function public.create_team_event(
  input_team_id uuid,
  input_event_type text,
  input_title text,
  input_description text,
  input_location text,
  input_starts_at timestamptz,
  input_ends_at timestamptz default null,
  input_response_deadline timestamptz default null
)
returns public.team_events
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_type text := lower(btrim(coalesce(input_event_type, '')));
  normalized_title text := btrim(coalesce(input_title, ''));
  created_event public.team_events;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not public.is_team_coach_or_admin(input_team_id) then
    raise exception 'COACH_OR_ADMIN_REQUIRED';
  end if;

  if normalized_type not in ('training', 'match', 'team_event') then
    raise exception 'INVALID_EVENT_TYPE';
  end if;

  if char_length(normalized_title) < 2 or char_length(normalized_title) > 100 then
    raise exception 'INVALID_TITLE';
  end if;

  if input_starts_at is null then
    raise exception 'INVALID_TIME';
  end if;

  if input_ends_at is not null and input_ends_at <= input_starts_at then
    raise exception 'INVALID_TIME';
  end if;

  insert into public.team_events (
    team_id,
    created_by,
    event_type,
    title,
    description,
    location,
    starts_at,
    ends_at,
    response_deadline
  )
  values (
    input_team_id,
    current_user_id,
    normalized_type,
    normalized_title,
    nullif(btrim(coalesce(input_description, '')), ''),
    nullif(btrim(coalesce(input_location, '')), ''),
    input_starts_at,
    input_ends_at,
    input_response_deadline
  )
  returning * into created_event;

  return created_event;
end;
$$;

create or replace function public.update_team_event(
  input_event_id uuid,
  input_event_type text,
  input_title text,
  input_description text,
  input_location text,
  input_starts_at timestamptz,
  input_ends_at timestamptz default null,
  input_response_deadline timestamptz default null
)
returns public.team_events
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_event public.team_events;
  normalized_type text := lower(btrim(coalesce(input_event_type, '')));
  normalized_title text := btrim(coalesce(input_title, ''));
  updated_event public.team_events;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into existing_event from public.team_events where id = input_event_id;

  if existing_event.id is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if not public.is_team_coach_or_admin(existing_event.team_id) then
    raise exception 'COACH_OR_ADMIN_REQUIRED';
  end if;

  if normalized_type not in ('training', 'match', 'team_event') then
    raise exception 'INVALID_EVENT_TYPE';
  end if;

  if char_length(normalized_title) < 2 or char_length(normalized_title) > 100 then
    raise exception 'INVALID_TITLE';
  end if;

  if input_starts_at is null or (input_ends_at is not null and input_ends_at <= input_starts_at) then
    raise exception 'INVALID_TIME';
  end if;

  update public.team_events
  set event_type = normalized_type,
      title = normalized_title,
      description = nullif(btrim(coalesce(input_description, '')), ''),
      location = nullif(btrim(coalesce(input_location, '')), ''),
      starts_at = input_starts_at,
      ends_at = input_ends_at,
      response_deadline = input_response_deadline
  where id = existing_event.id
  returning * into updated_event;

  return updated_event;
end;
$$;

create or replace function public.cancel_team_event(input_event_id uuid)
returns public.team_events
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_event public.team_events;
  cancelled_event public.team_events;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into existing_event from public.team_events where id = input_event_id;

  if existing_event.id is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if not public.is_team_coach_or_admin(existing_event.team_id) then
    raise exception 'COACH_OR_ADMIN_REQUIRED';
  end if;

  update public.team_events
  set status = 'cancelled'
  where id = existing_event.id
  returning * into cancelled_event;

  return cancelled_event;
end;
$$;

create or replace function public.respond_to_team_event(
  input_event_id uuid,
  input_response text,
  input_note text default null
)
returns public.event_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_event public.team_events;
  normalized_response text := lower(btrim(coalesce(input_response, '')));
  normalized_note text := nullif(btrim(coalesce(input_note, '')), '');
  saved_response public.event_responses;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if normalized_response not in ('accepted', 'maybe', 'declined') then
    raise exception 'INVALID_RESPONSE';
  end if;

  select * into existing_event from public.team_events where id = input_event_id;

  if existing_event.id is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if existing_event.status = 'cancelled' then
    raise exception 'EVENT_CANCELLED';
  end if;

  if not public.is_team_member(existing_event.team_id) then
    raise exception 'TEAM_REQUIRED';
  end if;

  if existing_event.response_deadline is not null and now() > existing_event.response_deadline then
    raise exception 'RESPONSE_DEADLINE_PASSED';
  end if;

  if normalized_note is not null and char_length(normalized_note) > 300 then
    raise exception 'NOTE_TOO_LONG';
  end if;

  insert into public.event_responses (event_id, user_id, response, note, responded_at)
  values (existing_event.id, current_user_id, normalized_response, normalized_note, now())
  on conflict (event_id, user_id) do update
    set response = excluded.response,
        note = excluded.note,
        responded_at = now(),
        updated_at = now()
  returning * into saved_response;

  return saved_response;
end;
$$;

create or replace function public.clear_team_event_response(input_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_event public.team_events;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into existing_event from public.team_events where id = input_event_id;

  if existing_event.id is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if existing_event.status = 'cancelled' then
    raise exception 'EVENT_CANCELLED';
  end if;

  if not public.is_team_member(existing_event.team_id) then
    raise exception 'TEAM_REQUIRED';
  end if;

  if existing_event.response_deadline is not null and now() > existing_event.response_deadline then
    raise exception 'RESPONSE_DEADLINE_PASSED';
  end if;

  delete from public.event_responses
  where event_id = existing_event.id
    and user_id = current_user_id;
end;
$$;

alter table public.team_events enable row level security;
alter table public.event_responses enable row level security;

drop policy if exists "team_events_select_members" on public.team_events;
create policy "team_events_select_members"
on public.team_events
for select
to authenticated
using (public.is_team_member(team_id));

drop policy if exists "event_responses_select_team_members" on public.event_responses;
create policy "event_responses_select_team_members"
on public.event_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.team_events te
    where te.id = event_id
      and public.is_team_member(te.team_id)
  )
);

revoke all on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from public;
grant execute on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) to authenticated;

revoke all on function public.update_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from public;
grant execute on function public.update_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) to authenticated;

revoke all on function public.cancel_team_event(uuid) from public;
grant execute on function public.cancel_team_event(uuid) to authenticated;

revoke all on function public.respond_to_team_event(uuid, text, text) from public;
grant execute on function public.respond_to_team_event(uuid, text, text) to authenticated;

revoke all on function public.clear_team_event_response(uuid) from public;
grant execute on function public.clear_team_event_response(uuid) to authenticated;
