alter table imports alter column file_path drop not null;
alter table imports alter column file_type drop not null;
alter table imports alter column file_size_bytes drop not null;
alter table imports alter column file_path set default '';
alter table imports alter column file_type set default 'text/csv';
alter table imports alter column file_size_bytes set default 0;

alter table imports add column if not exists preview_rows jsonb default '[]'::jsonb;
alter table imports add column if not exists mapped_rows jsonb default '[]'::jsonb;

alter table analyses drop constraint if exists analyses_status_check;
alter table analyses add constraint analyses_status_check check (status in ('draft','saved','finalized','archived'));

create table if not exists saved_mappings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  headers jsonb not null default '[]'::jsonb,
  mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table saved_mappings enable row level security;

create policy "members can manage saved mappings" on saved_mappings
for all using (
  exists (
    select 1 from organization_members om
    where om.organization_id = saved_mappings.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
) with check (
  exists (
    select 1 from organization_members om
    where om.organization_id = saved_mappings.organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);
