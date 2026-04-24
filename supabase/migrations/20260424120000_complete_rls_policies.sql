-- Org-scoped RLS policies for production browser/client access.

alter table if exists public.organization_members enable row level security;
alter table if exists public.imports enable row level security;
alter table if exists public.analyses enable row level security;
alter table if exists public.scenarios enable row level security;
alter table if exists public.scenario_results enable row level security;

-- Membership visibility and admin maintenance
drop policy if exists "org_members_read" on public.organization_members;
drop policy if exists "org_members_manage_admin" on public.organization_members;

create policy "org_members_read"
on public.organization_members
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

create policy "org_members_manage_admin"
on public.organization_members
for all
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  )
);

-- Imports
drop policy if exists "imports_org_member_access" on public.imports;
create policy "imports_org_member_access"
on public.imports
for all
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = imports.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = imports.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

-- Analyses
drop policy if exists "analyses_org_member_access" on public.analyses;
create policy "analyses_org_member_access"
on public.analyses
for all
to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = analyses.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = analyses.organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

-- Scenarios inherit access through their parent analysis
drop policy if exists "scenarios_org_member_access" on public.scenarios;
create policy "scenarios_org_member_access"
on public.scenarios
for all
to authenticated
using (
  exists (
    select 1
    from public.analyses a
    join public.organization_members m on m.organization_id = a.organization_id
    where a.id = scenarios.analysis_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.analyses a
    join public.organization_members m on m.organization_id = a.organization_id
    where a.id = scenarios.analysis_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

-- Scenario results inherit access through scenario -> analysis -> org
drop policy if exists "scenario_results_org_member_access" on public.scenario_results;
create policy "scenario_results_org_member_access"
on public.scenario_results
for all
to authenticated
using (
  exists (
    select 1
    from public.scenarios s
    join public.analyses a on a.id = s.analysis_id
    join public.organization_members m on m.organization_id = a.organization_id
    where s.id = scenario_results.scenario_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.scenarios s
    join public.analyses a on a.id = s.analysis_id
    join public.organization_members m on m.organization_id = a.organization_id
    where s.id = scenario_results.scenario_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);
