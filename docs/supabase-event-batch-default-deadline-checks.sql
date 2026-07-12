-- Read-only checks for 20260712163000_add_team_event_batch_and_default_deadlines.sql.
-- Run PRE-MIGRATION before an approved db push and POST-MIGRATION afterwards.
-- These queries must not change data.

-- ==================================================
-- A. PRE-MIGRATION
-- ==================================================

select 'pre_event_count' as check_name, count(*)::text as value
from public.team_events;

select
  'pre_event_id_fingerprint' as check_name,
  coalesce(md5(string_agg(id::text, ',' order by id)), 'empty') as value
from public.team_events;

select
  'pre_function_signature' as check_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  p.proconfig as function_config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_team_event',
    'create_team_events',
    'update_team_default_response_deadline'
  )
order by p.proname, identity_arguments;

select
  'pre_function_acl' as check_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
  has_function_privilege('anon', p.oid, 'execute') as anon_execute,
  has_function_privilege('public', p.oid, 'execute') as public_execute,
  p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_team_event',
    'create_team_events',
    'update_team_default_response_deadline'
  )
order by p.proname, identity_arguments;

select
  'pre_team_columns' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'teams'
  and column_name in (
    'default_response_deadline_enabled',
    'default_response_deadline_time'
  )
order by column_name;

select
  'pre_migration_registered' as check_name,
  version
from supabase_migrations.schema_migrations
where version = '20260712163000';

-- ==================================================
-- B. POST-MIGRATION
-- ==================================================

select
  'post_migration_registered' as check_name,
  exists (
    select 1
    from supabase_migrations.schema_migrations
    where version = '20260712163000'
  ) as migration_registered;

select
  'post_team_columns' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'teams'
  and column_name in (
    'default_response_deadline_enabled',
    'default_response_deadline_time'
  )
order by column_name;

select
  'post_team_column_expectations' as check_name,
  count(*) filter (
    where column_name = 'default_response_deadline_enabled'
      and data_type = 'boolean'
      and is_nullable = 'NO'
      and column_default = 'false'
  ) = 1 as default_enabled_ok,
  count(*) filter (
    where column_name = 'default_response_deadline_time'
      and data_type = 'time without time zone'
      and is_nullable = 'YES'
  ) = 1 as default_time_ok
from information_schema.columns
where table_schema = 'public'
  and table_name = 'teams';

select
  'post_constraint' as check_name,
  c.conname,
  pg_get_constraintdef(c.oid) as constraint_definition
from pg_constraint c
where c.conrelid = 'public.teams'::regclass
  and c.conname = 'teams_default_response_deadline_complete';

select
  'post_function_signature' as check_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  p.proconfig @> array['search_path=public'] as search_path_is_public
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_team_event',
    'create_team_events',
    'update_team_default_response_deadline'
  )
order by p.proname, identity_arguments;

with expected_functions(proname, identity_arguments) as (
  values
    (
      'create_team_event',
      'input_team_id uuid, input_event_type text, input_title text, input_description text, input_location text, input_starts_at timestamp with time zone, input_ends_at timestamp with time zone, input_response_deadline timestamp with time zone'
    ),
    (
      'create_team_events',
      'input_team_id uuid, input_title text, input_description text, input_event_type text, input_location text, input_occurrences jsonb, input_allow_duplicates boolean'
    ),
    (
      'update_team_default_response_deadline',
      'input_team_id uuid, input_enabled boolean, input_time time without time zone'
    )
),
actual_functions as (
  select
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_arguments
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'create_team_event',
      'create_team_events',
      'update_team_default_response_deadline'
    )
)
select
  'post_exact_function_overloads' as check_name,
  count(*) filter (where e.proname is not null) = 3 as all_expected_signatures_present,
  not exists (
    select 1
    from actual_functions a
    except
    select proname, identity_arguments
    from expected_functions
  ) as no_unexpected_overloads,
  count(*) = 3 as exact_function_count
from actual_functions a
left join expected_functions e
  on e.proname = a.proname
  and e.identity_arguments = a.identity_arguments;

select
  'post_function_acl' as check_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
  has_function_privilege('anon', p.oid, 'execute') as anon_execute,
  has_function_privilege('public', p.oid, 'execute') as public_execute,
  p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_team_event',
    'create_team_events',
    'update_team_default_response_deadline'
  )
order by p.proname, identity_arguments;

select
  'post_acl_expectations' as check_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  has_function_privilege('authenticated', p.oid, 'execute') = true
    and has_function_privilege('anon', p.oid, 'execute') = false
    and has_function_privilege('public', p.oid, 'execute') = false as expected_acl_ok
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'create_team_event',
    'create_team_events',
    'update_team_default_response_deadline'
  )
order by p.proname, identity_arguments;

with expected_functions(proname, identity_arguments) as (
  values
    (
      'create_team_event',
      'input_team_id uuid, input_event_type text, input_title text, input_description text, input_location text, input_starts_at timestamp with time zone, input_ends_at timestamp with time zone, input_response_deadline timestamp with time zone'
    ),
    (
      'create_team_events',
      'input_team_id uuid, input_title text, input_description text, input_event_type text, input_location text, input_occurrences jsonb, input_allow_duplicates boolean'
    ),
    (
      'update_team_default_response_deadline',
      'input_team_id uuid, input_enabled boolean, input_time time without time zone'
    )
),
actual_functions as (
  select
    p.oid,
    p.proowner,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    p.proacl
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join expected_functions e
    on e.proname = p.proname
    and e.identity_arguments = pg_get_function_identity_arguments(p.oid)
  where n.nspname = 'public'
),
public_acl as (
  select
    a.oid,
    bool_or(exploded.privilege_type = 'EXECUTE') filter (where exploded.grantee = 0) as public_execute_acl
  from actual_functions a
  left join lateral aclexplode(coalesce(a.proacl, acldefault('f', a.proowner))) as exploded on true
  group by a.oid
)
select
  'post_exact_acl_expectations' as check_name,
  a.proname,
  a.identity_arguments,
  has_function_privilege('authenticated', a.oid, 'execute') as authenticated_execute,
  has_function_privilege('anon', a.oid, 'execute') as anon_execute,
  coalesce(p.public_execute_acl, false) as public_execute_acl,
  has_function_privilege('authenticated', a.oid, 'execute') = true
    and has_function_privilege('anon', a.oid, 'execute') = false
    and coalesce(p.public_execute_acl, false) = false as expected_acl_ok
from actual_functions a
left join public_acl p on p.oid = a.oid
order by a.proname, a.identity_arguments;

with function_bodies as (
  select
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    pg_get_functiondef(p.oid) as function_definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('create_team_event', 'create_team_events')
)
select
  'post_function_body_expectations' as check_name,
  proname,
  identity_arguments,
  case
    when proname = 'create_team_events' then
      position('for update' in lower(function_definition)) > 0
      and position('DUPLICATE_EVENT_CONFLICT' in function_definition) > 0
      and position('INVALID_RESPONSE_DEADLINE_ORDER' in function_definition) > 0
      and position('RESPONSE_DEADLINE_ALREADY_PASSED' in function_definition) > 0
    when proname = 'create_team_event' then
      position('public.create_team_events' in function_definition) > 0
      and position('false' in lower(function_definition)) > 0
    else false
  end as body_expectations_ok
from function_bodies
order by proname, identity_arguments;

select
  'post_expected_signatures' as check_name,
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_team_event'
      and pg_get_function_identity_arguments(p.oid) =
        'input_team_id uuid, input_event_type text, input_title text, input_description text, input_location text, input_starts_at timestamp with time zone, input_ends_at timestamp with time zone, input_response_deadline timestamp with time zone'
  ) as old_create_team_event_signature_present,
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_team_events'
      and pg_get_function_identity_arguments(p.oid) =
        'input_team_id uuid, input_title text, input_description text, input_event_type text, input_location text, input_occurrences jsonb, input_allow_duplicates boolean'
  ) as new_create_team_events_signature_present,
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'update_team_default_response_deadline'
      and pg_get_function_identity_arguments(p.oid) =
        'input_team_id uuid, input_enabled boolean, input_time time without time zone'
  ) as update_default_deadline_signature_present;

select 'post_event_count' as check_name, count(*)::text as value
from public.team_events;

select
  'post_event_id_fingerprint' as check_name,
  coalesce(md5(string_agg(id::text, ',' order by id)), 'empty') as value
from public.team_events;

select
  'post_unexpected_enabled_default_deadlines' as check_name,
  count(*) as enabled_teams
from public.teams
where default_response_deadline_enabled = true;
