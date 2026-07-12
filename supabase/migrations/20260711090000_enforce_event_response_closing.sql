-- Zweck: Ergänzt die Schließprüfung für Termin-Rückmeldungen um den Fall, dass
-- keine Rückmeldefrist gesetzt ist. Bisher konnte ohne response_deadline auch
-- nach Terminbeginn noch geantwortet oder eine Antwort gelöscht werden. Diese
-- Migration erweitert respond_to_team_event und clear_team_event_response so,
-- dass ohne gesetzte Frist ab dem Terminstart (now() >= starts_at) ein neuer,
-- eigener Fehlercode RESPONSE_CLOSED geworfen wird. Ist eine Frist gesetzt,
-- bleibt die bestehende RESPONSE_DEADLINE_PASSED-Prüfung (strikt >) unverändert.
-- Alle übrigen Prüfungen, die UPSERT-/DELETE-Logik, security definer,
-- search_path sowie Grants/Revokes werden unverändert aus
-- 20260620162000_create_team_events_and_responses.sql übernommen.

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

  if existing_event.response_deadline is not null then
    if now() > existing_event.response_deadline then
      raise exception 'RESPONSE_DEADLINE_PASSED';
    end if;
  else
    if now() >= existing_event.starts_at then
      raise exception 'RESPONSE_CLOSED';
    end if;
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

  if existing_event.response_deadline is not null then
    if now() > existing_event.response_deadline then
      raise exception 'RESPONSE_DEADLINE_PASSED';
    end if;
  else
    if now() >= existing_event.starts_at then
      raise exception 'RESPONSE_CLOSED';
    end if;
  end if;

  delete from public.event_responses
  where event_id = existing_event.id
    and user_id = current_user_id;
end;
$$;

revoke all on function public.respond_to_team_event(uuid, text, text) from public;
revoke all on function public.respond_to_team_event(uuid, text, text) from anon;
grant execute on function public.respond_to_team_event(uuid, text, text) to authenticated;

revoke all on function public.clear_team_event_response(uuid) from public;
revoke all on function public.clear_team_event_response(uuid) from anon;
grant execute on function public.clear_team_event_response(uuid) to authenticated;
