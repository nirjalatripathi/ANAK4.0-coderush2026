-- RAHAT core schema: disasters, camps, needs, donations, impact.
-- Express uses the service-role/secret key and remains the write boundary.
-- Public Data API access is limited by RLS to published, non-demo rows.

create table if not exists public.app_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_meta (key, value)
values ('product', 'RAHAT'), ('schema', 'rahat_core')
on conflict (key) do nothing;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  role text not null default 'citizen'
    check (role in ('citizen', 'camp_official', 'local_authority', 'donor', 'admin')),
  full_name text not null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_authorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  title text not null default 'Local Disaster Management Officer',
  province text not null default 'Bagmati',
  district text not null,
  municipality text not null,
  wards text[] not null default '{}',
  contact_phone text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists local_authorities_district_idx on public.local_authorities (district);
create index if not exists local_authorities_municipality_idx on public.local_authorities (municipality);

create table if not exists public.disasters (
  id uuid primary key default gen_random_uuid(),
  disaster_id text not null unique,
  name text not null,
  type text not null,
  location text not null default '',
  district text not null default '',
  municipality text not null default '',
  ward text not null default '',
  occurred_on date not null,
  severity text not null default 'Moderate',
  description text not null default '',
  affected_wards text[] not null default '{}',
  expected_population integer not null default 0,
  disaster_level integer not null default 2 check (disaster_level between 1 and 4),
  status text not null default 'Monitoring',
  is_public boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists disasters_status_idx on public.disasters (status);
create index if not exists disasters_public_idx on public.disasters (is_public, is_demo);

create table if not exists public.relief_camps (
  id uuid primary key default gen_random_uuid(),
  camp_id text not null unique,
  name text not null,
  location text not null default '',
  district text not null default '',
  municipality text not null default '',
  ward text not null default '',
  camp_head text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  capacity integer not null default 0,
  current_population integer not null default 0,
  disaster_id uuid references public.disasters (id) on delete set null,
  camp_status text not null default 'Active',
  is_active boolean not null default true,
  is_demo boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists relief_camps_active_idx on public.relief_camps (is_active, is_demo);
create index if not exists relief_camps_disaster_idx on public.relief_camps (disaster_id);

create table if not exists public.camp_officials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  official_id text not null unique,
  full_name text not null,
  assigned_camp_id uuid not null references public.relief_camps (id) on delete restrict,
  phone text not null default '',
  designation text not null default 'Camp Official',
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists camp_officials_camp_idx on public.camp_officials (assigned_camp_id);
create index if not exists camp_officials_user_idx on public.camp_officials (user_id);

create table if not exists public.camp_inventory (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.relief_camps (id) on delete cascade,
  item_name text not null,
  current_qty numeric not null default 0,
  required_qty numeric not null default 0,
  incoming_qty numeric not null default 0,
  distributed_qty numeric not null default 0,
  daily_consumption numeric not null default 0,
  unit text not null default 'units',
  priority text not null default 'MEDIUM',
  priority_reason text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (camp_id, item_name)
);

create index if not exists camp_inventory_camp_idx on public.camp_inventory (camp_id);
create index if not exists camp_inventory_priority_idx on public.camp_inventory (priority);

create table if not exists public.relief_needs (
  id uuid primary key default gen_random_uuid(),
  camp_id uuid not null references public.relief_camps (id) on delete cascade,
  inventory_id uuid references public.camp_inventory (id) on delete set null,
  item_name text not null,
  available_qty numeric not null default 0,
  required_qty numeric not null default 0,
  shortage numeric not null default 0,
  projected_shortage numeric not null default 0,
  unit text not null default 'units',
  priority text not null default 'MEDIUM',
  priority_reason text not null default '',
  is_published boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists relief_needs_camp_idx on public.relief_needs (camp_id);
create index if not exists relief_needs_published_idx on public.relief_needs (is_published, priority);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donation_id text not null unique,
  kind text not null default 'Physical' check (kind in ('Money', 'Physical')),
  donor_name text not null,
  donor_email text not null default '',
  donor_phone text not null default '',
  donor_user_id uuid references public.users (id) on delete set null,
  donor_type text not null default 'Individual',
  camp_id uuid references public.relief_camps (id) on delete set null,
  relief_need_id uuid references public.relief_needs (id) on delete set null,
  item_name text not null default '',
  quantity numeric not null default 0,
  unit text not null default '',
  amount_npr numeric not null default 0,
  allocated_amount numeric not null default 0,
  used_amount numeric not null default 0,
  remaining_amount numeric not null default 0,
  purpose text not null default '',
  message text not null default '',
  status text not null default 'Pending',
  pledged_quantity numeric not null default 0,
  received_quantity numeric not null default 0,
  people_supported integer not null default 0,
  timeline jsonb not null default '[]'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_status_idx on public.donations (status);
create index if not exists donations_donor_idx on public.donations (donor_user_id);
create index if not exists donations_camp_idx on public.donations (camp_id);
create index if not exists donations_demo_idx on public.donations (is_demo);

create table if not exists public.donation_allocations (
  id uuid primary key default gen_random_uuid(),
  allocation_id text not null unique,
  donation_id uuid not null references public.donations (id) on delete cascade,
  need_id uuid references public.relief_needs (id) on delete set null,
  camp_id uuid references public.relief_camps (id) on delete set null,
  item_name text not null default '',
  amount_npr numeric not null default 0,
  quantity numeric not null default 0,
  reason text not null default '',
  allocated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donation_allocations_donation_idx on public.donation_allocations (donation_id);
create index if not exists donation_allocations_need_idx on public.donation_allocations (need_id);

create table if not exists public.impact_records (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations (id) on delete cascade,
  camp_id uuid references public.relief_camps (id) on delete set null,
  item_name text not null default '',
  amount_used_npr numeric not null default 0,
  quantity_delivered numeric not null default 0,
  unit text not null default '',
  people_supported integer not null default 0,
  location text not null default '',
  verified_by uuid references public.users (id) on delete set null,
  verified_at timestamptz,
  notes text not null default '',
  donor_facing boolean not null default true,
  proofs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists impact_records_donation_idx on public.impact_records (donation_id);
create index if not exists impact_records_public_idx on public.impact_records (donor_facing);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  audience text not null default 'user' check (audience in ('user', 'role', 'all')),
  role text not null default '',
  title text not null,
  body text not null,
  type text not null default 'system',
  is_read boolean not null default false,
  related_model text not null default '',
  related_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  actor_name text not null default 'System',
  role text not null default '',
  action text not null,
  entity_type text not null default '',
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  ip text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action, created_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

create or replace view public.public_donations as
select
  donation_id,
  kind,
  item_name,
  quantity,
  unit,
  status,
  people_supported,
  created_at
from public.donations
where is_demo = false
  and status not in ('Rejected', 'Cancelled');

revoke all on public.public_donations from anon, authenticated;
grant select on public.public_donations to anon, authenticated;

alter table public.app_meta enable row level security;
alter table public.users enable row level security;
alter table public.local_authorities enable row level security;
alter table public.disasters enable row level security;
alter table public.relief_camps enable row level security;
alter table public.camp_officials enable row level security;
alter table public.camp_inventory enable row level security;
alter table public.relief_needs enable row level security;
alter table public.donations enable row level security;
alter table public.donation_allocations enable row level security;
alter table public.impact_records enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_messages enable row level security;

create policy "public can read app meta"
on public.app_meta
for select
to anon, authenticated
using (true);

create policy "public can read published disasters"
on public.disasters
for select
to anon, authenticated
using (is_public = true and is_demo = false);

create policy "public can read active camps"
on public.relief_camps
for select
to anon, authenticated
using (is_active = true and is_demo = false);

create policy "public can read published needs"
on public.relief_needs
for select
to anon, authenticated
using (is_published = true);

create policy "public can read donor-facing impact"
on public.impact_records
for select
to anon, authenticated
using (donor_facing = true);

create policy "anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

revoke all on public.users from anon, authenticated;
revoke all on public.local_authorities from anon, authenticated;
revoke all on public.camp_officials from anon, authenticated;
revoke all on public.camp_inventory from anon, authenticated;
revoke all on public.donations from anon, authenticated;
revoke all on public.donation_allocations from anon, authenticated;
revoke all on public.notifications from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke select on public.contact_messages from anon, authenticated;

grant select on public.app_meta to anon, authenticated;
grant select on public.disasters to anon, authenticated;
grant select on public.relief_camps to anon, authenticated;
grant select on public.relief_needs to anon, authenticated;
grant select on public.impact_records to anon, authenticated;
grant select on public.public_donations to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
