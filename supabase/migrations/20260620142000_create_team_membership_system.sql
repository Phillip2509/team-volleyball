create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(btrim(display_name)) between 2 and 50)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_by uuid not null references public.profiles(id),
  accent_color text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_name_length
    check (char_length(btrim(name)) between 2 and 80),
  constraint teams_join_code_format
    check (join_code ~ '^[A-HJ-NP-Z2-9]{6,8}$')
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  joined_at timestamptz not null default now(),
  constraint team_members_team_user_unique unique (team_id, user_id),
  constraint team_members_role_check check (role in ('player', 'coach', 'admin'))
);

create index if not exists team_members_user_id_idx on public.team_members(user_id);
create index if not exists team_members_team_id_idx on public.team_members(team_id);
create index if not exists teams_join_code_idx on public.teams(join_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_name text;
  safe_display_name text;
begin
  metadata_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '')
  );

  safe_display_name := coalesce(metadata_name, 'Neues Mitglied');
  safe_display_name := left(safe_display_name, 50);

  if char_length(btrim(safe_display_name)) < 2 then
    safe_display_name := 'Neues Mitglied';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, safe_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.is_team_member(input_team_id uuid)
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
  );
$$;

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
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
  );
$$;

create or replace function public.can_read_profile(input_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = input_profile_id
    or exists (
      select 1
      from public.team_members self_membership
      join public.team_members other_membership
        on other_membership.team_id = self_membership.team_id
      where self_membership.user_id = auth.uid()
        and other_membership.user_id = input_profile_id
    );
$$;

create or replace function public.generate_team_join_code(code_length integer default 7)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generated_code text := '';
  index_value integer;
begin
  if code_length < 6 or code_length > 8 then
    raise exception 'INVALID_CODE_LENGTH';
  end if;

  for counter in 1..code_length loop
    index_value := floor(random() * length(alphabet) + 1)::integer;
    generated_code := generated_code || substr(alphabet, index_value, 1);
  end loop;

  return generated_code;
end;
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
  values (created_team.id, current_user_id, 'admin');

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
  values (matched_team.id, current_user_id, 'player');

  return matched_team;
end;
$$;

create or replace function public.upsert_own_profile(input_display_name text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_display_name text := btrim(regexp_replace(coalesce(input_display_name, ''), '\s+', ' ', 'g'));
  saved_profile public.profiles;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if char_length(normalized_display_name) < 2 or char_length(normalized_display_name) > 50 then
    raise exception 'INVALID_DISPLAY_NAME';
  end if;

  insert into public.profiles (id, display_name)
  values (current_user_id, normalized_display_name)
  on conflict (id) do update
    set display_name = excluded.display_name,
        updated_at = now()
  returning * into saved_profile;

  return saved_profile;
end;
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "profiles_select_own_or_team_members" on public.profiles;
create policy "profiles_select_own_or_team_members"
on public.profiles
for select
to authenticated
using (public.can_read_profile(id));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and char_length(btrim(display_name)) between 2 and 50
);

drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member"
on public.teams
for select
to authenticated
using (public.is_team_member(id));

drop policy if exists "teams_update_admin" on public.teams;
create policy "teams_update_admin"
on public.teams
for update
to authenticated
using (public.is_team_admin(id))
with check (public.is_team_admin(id));

drop policy if exists "team_members_select_team_members" on public.team_members;
create policy "team_members_select_team_members"
on public.team_members
for select
to authenticated
using (user_id = auth.uid() or public.is_team_member(team_id));

revoke all on function public.create_team_with_admin_membership(text) from public;
grant execute on function public.create_team_with_admin_membership(text) to authenticated;

revoke all on function public.join_team_by_code(text) from public;
grant execute on function public.join_team_by_code(text) to authenticated;

revoke all on function public.upsert_own_profile(text) from public;
grant execute on function public.upsert_own_profile(text) to authenticated;
