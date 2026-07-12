-- Manual rollback documentation for 20260712163000_add_team_event_batch_and_default_deadlines.sql.
-- Review manually before execution. Do not run automatically from Codex.
--
-- Important:
-- - Events already created through create_team_events are not deleted by this schema rollback.
-- - Dropping the new team columns permanently removes saved default response deadline settings.
-- - This restores the previous create_team_event body from
--   20260620162000_create_team_events_and_responses.sql.

begin;

drop function if exists public.create_team_events(uuid, text, text, text, text, jsonb, boolean);
drop function if exists public.update_team_default_response_deadline(uuid, boolean, time);

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

revoke all on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from public;
revoke all on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) from anon;
grant execute on function public.create_team_event(uuid, text, text, text, text, timestamptz, timestamptz, timestamptz) to authenticated;

alter table public.teams
drop constraint if exists teams_default_response_deadline_complete,
drop column if exists default_response_deadline_enabled,
drop column if exists default_response_deadline_time;

commit;
