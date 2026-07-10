-- Mehrfachrollen-System (Rollen-Grundlage)
--
-- Zweck: Mitglieder können mehrere Rollen gleichzeitig besitzen (z.B. Trainer + Spieler).
-- Die normalisierte Tabelle public.team_member_roles ist die neue Quelle der Wahrheit.
-- Die bestehende Spalte public.team_members.role bleibt zusätzlich bestehen und wird von
-- den RPCs synchron gehalten (Priorität admin > coach > player), damit bestehender
-- Event-/Settings-Code unverändert weiterläuft.
--
-- Backfill-Regel (einmalig, idempotent): player -> player, coach -> coach,
-- admin -> admin + player (Admins sind implizit auch Spieler).
--
-- Produktregel: Selbständerung der eigenen Rollen ist erlaubt. Der letzte Admin eines
-- Teams ist serverseitig geschützt (LAST_ADMIN_REQUIRED) und kann seine Admin-Rolle nicht
-- verlieren, solange kein anderer Admin im Team existiert.

create table if not exists public.team_member_roles (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  role text not null check (role in ('player', 'coach', 'admin')),
  assigned_at timestamptz not null default now(),
  unique (team_member_id, role)
);

create index if not exists team_member_roles_member_idx on public.team_member_roles(team_member_id);

alter table public.team_member_roles enable row level security;

drop policy if exists "team_member_roles_select_team_members" on public.team_member_roles;
create policy "team_member_roles_select_team_members"
on public.team_member_roles
for select
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.id = team_member_roles.team_member_id
      and public.is_team_member(tm.team_id)
  )
);

grant select on public.team_member_roles to authenticated;

-- Idempotenter Backfill bestehender Mitgliedschaften.
insert into public.team_member_roles (team_member_id, role)
select id, role from public.team_members
on conflict (team_member_id, role) do nothing;

insert into public.team_member_roles (team_member_id, role)
select id, 'player' from public.team_members where role = 'admin'
on conflict (team_member_id, role) do nothing;

create or replace function public.is_team_admin(input_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    join public.team_member_roles tmr on tmr.team_member_id = tm.id
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tmr.role = 'admin'
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
  );
$$;

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
    join public.team_member_roles tmr on tmr.team_member_id = tm.id
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tmr.role in ('coach', 'admin')
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tm.role in ('coach', 'admin')
  );
$$;

create or replace function public.create_team_with_admin_membership(team_name text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_team_name text := btrim(coalesce(team_name, ''));
  generated_code text;
  created_team public.teams;
  created_membership_id uuid;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (select 1 from public.profiles where id = current_user_id) then
    raise exception 'PROFILE_MISSING';
  end if;

  if char_length(normalized_team_name) < 2 or char_length(normalized_team_name) > 80 then
    raise exception 'INVALID_TEAM_NAME';
  end if;

  loop
    generated_code := public.generate_team_join_code(7);
    exit when not exists (
      select 1 from public.teams where join_code = generated_code
    );
  end loop;

  insert into public.teams (name, join_code, created_by)
  values (normalized_team_name, generated_code, current_user_id)
  returning * into created_team;

  insert into public.team_members (team_id, user_id, role)
  values (created_team.id, current_user_id, 'admin')
  returning id into created_membership_id;

  insert into public.team_member_roles (team_member_id, role)
  values (created_membership_id, 'admin'), (created_membership_id, 'player')
  on conflict (team_member_id, role) do nothing;

  return created_team;
end;
$$;

create or replace function public.join_team_by_code(input_code text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := upper(regexp_replace(btrim(coalesce(input_code, '')), '\s+', '', 'g'));
  matched_team public.teams;
  created_membership_id uuid;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (select 1 from public.profiles where id = current_user_id) then
    raise exception 'PROFILE_MISSING';
  end if;

  if normalized_code = '' then
    raise exception 'INVALID_JOIN_CODE';
  end if;

  select *
  into matched_team
  from public.teams
  where join_code = normalized_code;

  if matched_team.id is null then
    raise exception 'INVALID_JOIN_CODE';
  end if;

  if exists (
    select 1
    from public.team_members
    where team_id = matched_team.id
      and user_id = current_user_id
  ) then
    raise exception 'ALREADY_TEAM_MEMBER';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (matched_team.id, current_user_id, 'player')
  returning id into created_membership_id;

  insert into public.team_member_roles (team_member_id, role)
  values (created_membership_id, 'player')
  on conflict (team_member_id, role) do nothing;

  return matched_team;
end;
$$;

create or replace function public.update_team_member_roles(
  input_team_id uuid,
  input_user_id uuid,
  input_roles text[]
)
returns public.team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_membership public.team_members;
  updated_membership public.team_members;
  normalized_roles text[];
  role_value text;
  admin_count integer;
  target_has_admin boolean;
  target_keeps_admin boolean;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not public.is_team_admin(input_team_id) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if input_roles is null or array_length(input_roles, 1) is null then
    raise exception 'AT_LEAST_ONE_ROLE_REQUIRED';
  end if;

  select array_agg(distinct lower(btrim(role_item)))
  into normalized_roles
  from unnest(input_roles) as role_item;

  if normalized_roles is null or array_length(normalized_roles, 1) is null then
    raise exception 'AT_LEAST_ONE_ROLE_REQUIRED';
  end if;

  foreach role_value in array normalized_roles loop
    if role_value not in ('player', 'coach', 'admin') then
      raise exception 'INVALID_ROLE';
    end if;
  end loop;

  select *
  into target_membership
  from public.team_members
  where team_id = input_team_id
    and user_id = input_user_id;

  if target_membership.id is null then
    raise exception 'MEMBER_NOT_FOUND';
  end if;

  target_has_admin := exists (
    select 1
    from public.team_member_roles
    where team_member_id = target_membership.id
      and role = 'admin'
  );

  target_keeps_admin := 'admin' = any(normalized_roles);

  if target_has_admin and not target_keeps_admin then
    select count(distinct tmr.team_member_id)
    into admin_count
    from public.team_member_roles tmr
    join public.team_members tm on tm.id = tmr.team_member_id
    where tm.team_id = input_team_id
      and tmr.role = 'admin';

    if admin_count <= 1 then
      raise exception 'LAST_ADMIN_REQUIRED';
    end if;
  end if;

  delete from public.team_member_roles
  where team_member_id = target_membership.id;

  insert into public.team_member_roles (team_member_id, role)
  select target_membership.id, r
  from unnest(normalized_roles) as r;

  update public.team_members
  set role = case
    when 'admin' = any(normalized_roles) then 'admin'
    when 'coach' = any(normalized_roles) then 'coach'
    else 'player'
  end
  where id = target_membership.id
  returning * into updated_membership;

  return updated_membership;
end;
$$;

drop function if exists public.update_team_member_role(uuid, uuid, text);

revoke all on function public.update_team_member_roles(uuid, uuid, text[]) from public;
grant execute on function public.update_team_member_roles(uuid, uuid, text[]) to authenticated;
