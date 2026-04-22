create extension if not exists "uuid-ossp";

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  country_code text,
  default_currency text,
  default_locale text default 'fr-FR',
  logo_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  status text not null check (status in ('active','invited','disabled')),
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

create table if not exists imports (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size_bytes bigint not null,
  status text not null check (status in ('uploaded','mapped','processed','failed')) default 'uploaded',
  raw_header jsonb,
  created_at timestamptz default now()
);

create table if not exists analyses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  import_id uuid references imports(id),
  title text not null,
  status text not null check (status in ('draft','finalized','archived')) default 'draft',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scenarios (
  id uuid primary key default uuid_generate_v4(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  name text not null,
  is_baseline boolean not null default false,
  rank_order int not null default 0,
  assumption_overrides jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists scenario_results (
  id uuid primary key default uuid_generate_v4(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  computed_at timestamptz default now(),
  result_summary jsonb not null
);

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table imports enable row level security;
alter table analyses enable row level security;
alter table scenarios enable row level security;
alter table scenario_results enable row level security;

create policy "members can read organizations" on organizations
for select using (
  exists (
    select 1 from organization_members om
    where om.organization_id = organizations.id
      and om.user_id = auth.uid()
      and om.status = 'active'
  )
);
