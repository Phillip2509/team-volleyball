create or replace function public.update_team_member_role(
  input_team_id uuid,
  input_user_id uuid,
  input_role text
)
returns public.team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_role text := lower(btrim(coalesce(input_role, '')));
  target_membership public.team_members;
  updated_membership public.team_members;
  admin_count integer;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if normalized_role not in ('player', 'coach', 'admin') then
    raise exception 'INVALID_ROLE';
  end if;

  if input_user_id = current_user_id then
    raise exception 'CANNOT_CHANGE_OWN_ROLE';
  end if;

  if not public.is_team_admin(input_team_id) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select *
  into target_membership
  from public.team_members
  where team_id = input_team_id
    and user_id = input_user_id;

  if target_membership.id is null then
    raise exception 'MEMBER_NOT_FOUND';
  end if;

  if target_membership.role = 'admin' and normalized_role <> 'admin' then
    select count(*)
    into admin_count
    from public.team_members
    where team_id = input_team_id
      and role = 'admin';

    if admin_count <= 1 then
      raise exception 'LAST_ADMIN_REQUIRED';
    end if;
  end if;

  update public.team_members
  set role = normalized_role
  where id = target_membership.id
  returning * into updated_membership;

  return updated_membership;
end;
$$;

revoke all on function public.update_team_member_role(uuid, uuid, text) from public;
grant execute on function public.update_team_member_role(uuid, uuid, text) to authenticated;
