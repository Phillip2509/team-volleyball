alter table public.teams
add column if not exists default_response_deadline_enabled boolean not null default false,
add column if not exists default_response_deadline_time time null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teams_default_response_deadline_complete'
      and conrelid = 'public.teams'::regclass
  ) then
    alter table public.teams
    add constraint teams_default_response_deadline_complete
      check (
        (default_response_deadline_enabled = false)
        or (default_response_deadline_enabled = true and default_response_deadline_time is not null)
      );
  end if;
end;
$$;

create or replace function public.update_team_default_response_deadline(
  input_team_id uuid,
  input_enabled boolean,
  input_time time default null
)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_team public.teams;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not public.is_team_coach_or_admin(input_team_id) then
    raise exception 'COACH_OR_ADMIN_REQUIRED';
  end if;

  if coalesce(input_enabled, false) and input_time is null then
    raise exception 'INVALID_DEFAULT_RESPONSE_DEADLINE';
  end if;

  update public.teams
  set default_response_deadline_enabled = coalesce(input_enabled, false),
      default_response_deadline_time = case
        when coalesce(input_enabled, false) then input_time
        else null
      end
  where id = input_team_id
  returning * into updated_team;

  if updated_team.id is null then
    raise exception 'TEAM_NOT_FOUND';
  end if;

  return updated_team;
end;
$$;

create or replace function public.create_team_events(
  input_team_id uuid,
  input_title text,
  input_description text,
  input_event_type text,
  input_location text,
  input_occurrences jsonb,
  input_allow_duplicates boolean default false
)
returns setof public.team_events
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_type text := lower(btrim(coalesce(input_event_type, '')));
  normalized_title text := btrim(coalesce(input_title, ''));
  occurrence_count integer;
  occurrence jsonb;
  starts_at_value timestamptz;
  ends_at_value timestamptz;
  deadline_value timestamptz;
  created_id uuid;
  created_ids uuid[] := '{}';
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

  if not coalesce(input_allow_duplicates, false) then
    perform 1
    from public.teams
    where id = input_team_id
    for update;
  end if;

  if input_occurrences is null or jsonb_typeof(input_occurrences) <> 'array' then
    raise exception 'INVALID_OCCURRENCES';
  end if;

  occurrence_count := jsonb_array_length(input_occurrences);

  if occurrence_count < 1 then
    raise exception 'INVALID_OCCURRENCES';
  end if;

  if occurrence_count > 20 then
    raise exception 'TOO_MANY_OCCURRENCES';
  end if;

  for occurrence in select value from jsonb_array_elements(input_occurrences)
  loop
    begin
      starts_at_value := nullif(occurrence->>'starts_at', '')::timestamptz;
      ends_at_value := nullif(occurrence->>'ends_at', '')::timestamptz;
      deadline_value := nullif(occurrence->>'response_deadline', '')::timestamptz;
    exception
      when others then
        raise exception 'INVALID_OCCURRENCES';
    end;

    if starts_at_value is null or starts_at_value <= now() then
      raise exception 'INVALID_TIME';
    end if;

    if ends_at_value is not null and ends_at_value <= starts_at_value then
      raise exception 'INVALID_TIME';
    end if;

    if deadline_value is not null and deadline_value >= starts_at_value then
      raise exception 'INVALID_RESPONSE_DEADLINE_ORDER';
    end if;

    if deadline_value is not null and deadline_value <= now() then
      raise exception 'RESPONSE_DEADLINE_ALREADY_PASSED';
    end if;
  end loop;

  if exists (
    select 1
    from (
      select nullif(value->>'starts_at', '')::timestamptz as starts_at
      from jsonb_array_elements(input_occurrences)
    ) occurrence_values
    group by occurrence_values.starts_at
    having count(*) > 1
  ) then
    raise exception 'DUPLICATE_EVENT_CONFLICT';
  end if;

  if not coalesce(input_allow_duplicates, false) and exists (
    select 1
    from public.team_events existing_event
    join (
      select nullif(value->>'starts_at', '')::timestamptz as starts_at
      from jsonb_array_elements(input_occurrences)
    ) occurrence_values on occurrence_values.starts_at = existing_event.starts_at
    where existing_event.team_id = input_team_id
      and existing_event.status = 'scheduled'
  ) then
    raise exception 'DUPLICATE_EVENT_CONFLICT';
  end if;

  for occurrence in select value from jsonb_array_elements(input_occurrences)
  loop
    starts_at_value := nullif(occurrence->>'starts_at', '')::timestamptz;
    ends_at_value := nullif(occurrence->>'ends_at', '')::timestamptz;
    deadline_value := nullif(occurrence->>'response_deadline', '')::timestamptz;

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
      starts_at_value,
      ends_at_value,
      deadline_value
    )
    returning id into created_id;

    created_ids := array_append(created_ids, created_id);
  end loop;

  return query
  select *
  from public.team_events
  where id = any(created_ids)
  order by starts_at asc;
end;
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
  created_event public.team_events;
begin
  select *
  into created_event
  from public.create_team_events(
    input_team_id,
    input_title,
    input_description,
    input_event_type,
    input_location,
    jsonb_build_array(
      jsonb_build_object(
        'starts_at', input_starts_at,
        'ends_at', input_ends_at,
        'response_deadline', input_response_deadline
      )
    ),
    false
  )
  limit 1;

  return created_event;
end;
$$;

revoke all on function public.update_team_default_response_deadline(uuid, boolean, time) from public;
revoke all on function public.update_team_default_response_deadline(uuid, boolean, time) from anon;
grant execute on function public.update_team_default_response_deadline(uuid, boolean, time) to authenticated;

revoke all on function public.create_team_events(uuid, text, text, text, text, jsonb, boolean) from public;
revoke all on function public.create_team_events(uuid, text, text, text, text, jsonb, boolean) from anon;
grant execute on function public.create_team_events(uuid, text, text, text, text, jsonb, boolean) to authenticated;

revoke all on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from public;
revoke all on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from anon;
grant execute on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) to authenticated;
