-- RAHAT seed data. Run after 20260906110710_rahat_core.sql

insert into public.users (email, password_hash, role, full_name, is_active)
values
  ('admin@rahat.gov.np', '$2b$10$vhTrphxJmN.OEDZ7TmWaQ.6BBUbKgiMqy6YBK30Q1oCAY5SAplo6S', 'admin', 'RAHAT System Administrator', true),
  ('donor.demo@rahat.test', '$2b$10$NESVXLdb7xZcumVkQVBqleUt7Ujx4msV3lc/2rir9Zaw8CnEbYnw6', 'donor', 'Valley Mutual Aid Donor', true),
  ('authority.suryabinayak@rahat.gov.np', '$2b$10$4gLeLN3O4wfCWmUroolHIuWvsTbspZ32cBktoCfD6W3ithjEUTdrK', 'local_authority', 'Suryabinayak LDMC Officer', true),
  ('official.a@rahat.gov.np', '$2b$10$vWByCeGqJLa/kdjCqUEx3.z1aBBw7kLnNkoBVr0v0A8RViPsm5OiS', 'camp_official', 'Bimala Tamang', true)
on conflict (email) do update
set full_name = excluded.full_name,
    role = excluded.role,
    is_active = true,
    updated_at = now();

insert into public.disasters (
  disaster_id, name, type, location, district, municipality, ward, occurred_on,
  severity, description, affected_wards, expected_population, disaster_level, status, is_public, is_demo
) values (
  'DIS-2026-0001',
  'Suryabinayak monsoon flood',
  'Flood',
  'Hanumante corridor, Suryabinayak',
  'Bhaktapur',
  'Suryabinayak Municipality',
  '6',
  '2026-09-04',
  'High',
  'Verified local flood affecting wards 5, 6 and 7. Relief is coordinated through published camp needs.',
  array['5','6','7'],
  2840,
  3,
  'Active',
  true,
  false
)
on conflict (disaster_id) do update
set name = excluded.name,
    status = excluded.status,
    is_demo = false,
    updated_at = now();

insert into public.local_authorities (user_id, title, province, district, municipality, wards, contact_phone, is_demo)
select id, 'Local Disaster Management Officer', 'Bagmati', 'Bhaktapur', 'Suryabinayak Municipality', array['5','6','7'], '01-6612345', false
from public.users
where email = 'authority.suryabinayak@rahat.gov.np'
on conflict (user_id) do update
set municipality = excluded.municipality,
    wards = excluded.wards,
    updated_at = now();

insert into public.relief_camps (
  camp_id, name, location, district, municipality, ward, camp_head, contact_phone, contact_email,
  capacity, current_population, disaster_id, camp_status, is_active, is_demo, notes
)
select
  v.camp_id, v.name, v.location, v.district, v.municipality, v.ward, v.camp_head, v.contact_phone, v.contact_email,
  v.capacity, v.current_population, d.id, 'Active', true, false, v.notes
from public.disasters d
cross join (
  values
    ('CAMP-2026-0001', 'Camp A — Bhaktapur Emergency Shelter', 'Suryabinayak Ground, Bhaktapur', 'Bhaktapur', 'Suryabinayak Municipality', '4', 'Bimala Tamang', '01-6611001', 'camp.a@rahat.gov.np', 1000, 186, 'Primary shelter for wards 5–7.'),
    ('CAMP-2026-0002', 'Camp B — Kathmandu Central Relief Camp', 'Tundikhel Coordination Area, Kathmandu', 'Kathmandu', 'Kathmandu Metropolitan City', '11', 'Prakash Adhikari', '01-4211002', 'camp.b@rahat.gov.np', 1500, 420, 'Overflow and medical staging camp.')
) as v(camp_id, name, location, district, municipality, ward, camp_head, contact_phone, contact_email, capacity, current_population, notes)
where d.disaster_id = 'DIS-2026-0001'
on conflict (camp_id) do update
set name = excluded.name,
    current_population = excluded.current_population,
    is_demo = false,
    is_active = true,
    updated_at = now();

insert into public.camp_officials (user_id, official_id, full_name, assigned_camp_id, phone, designation, is_active, is_demo)
select u.id, 'OFF-2026-0001', 'Bimala Tamang', c.id, '9800000001', 'Camp Coordination Officer', true, false
from public.users u
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
where u.email = 'official.a@rahat.gov.np'
on conflict (official_id) do update
set assigned_camp_id = excluded.assigned_camp_id,
    full_name = excluded.full_name,
    updated_at = now();

delete from public.camp_inventory
where camp_id in (select id from public.relief_camps where camp_id in ('CAMP-2026-0001', 'CAMP-2026-0002'));

insert into public.camp_inventory (camp_id, item_name, current_qty, required_qty, incoming_qty, unit, priority, priority_reason)
select c.id, v.item_name, v.current_qty, v.required_qty, v.incoming_qty, v.unit, v.priority, v.priority_reason
from public.relief_camps c
join (
  values
    ('CAMP-2026-0001', 'Drinking Water', 1200, 8000, 500, 'L', 'CRITICAL', 'Daily use exceeds stock'),
    ('CAMP-2026-0001', 'Rice', 80, 400, 0, 'kg', 'CRITICAL', 'Less than two days of supply'),
    ('CAMP-2026-0001', 'Blankets', 90, 320, 40, 'units', 'HIGH', 'Night temperature dropping'),
    ('CAMP-2026-0001', 'Medicines', 25, 180, 0, 'kits', 'CRITICAL', 'Clinic stock nearly empty'),
    ('CAMP-2026-0002', 'Hygiene Kits', 40, 200, 20, 'kits', 'HIGH', 'New arrivals this week'),
    ('CAMP-2026-0002', 'Baby Food', 12, 80, 0, 'packs', 'CRITICAL', 'Infants in camp B')
) as v(camp_code, item_name, current_qty, required_qty, incoming_qty, unit, priority, priority_reason)
  on c.camp_id = v.camp_code;

delete from public.relief_needs
where camp_id in (select id from public.relief_camps where camp_id in ('CAMP-2026-0001', 'CAMP-2026-0002'));

insert into public.relief_needs (
  camp_id, inventory_id, item_name, available_qty, required_qty, shortage, projected_shortage, unit, priority, priority_reason, is_published
)
select
  i.camp_id,
  i.id,
  i.item_name,
  i.current_qty,
  i.required_qty,
  greatest(0, i.required_qty - i.current_qty),
  greatest(0, i.required_qty - i.current_qty - i.incoming_qty),
  i.unit,
  i.priority,
  i.priority_reason,
  true
from public.camp_inventory i
join public.relief_camps c on c.id = i.camp_id
where c.camp_id in ('CAMP-2026-0001', 'CAMP-2026-0002');

insert into public.donations (
  donation_id, kind, donor_name, donor_email, donor_phone, donor_user_id, donor_type, camp_id, relief_need_id,
  item_name, quantity, unit, amount_npr, allocated_amount, used_amount, remaining_amount, purpose, status,
  pledged_quantity, received_quantity, people_supported, timeline, is_demo
)
select
  'RAHAT-DON-000001',
  'Money',
  'Valley Mutual Aid Donor',
  'donor.demo@rahat.test',
  '9801111222',
  u.id,
  'Community Organization',
  c.id,
  n.id,
  'Drinking Water',
  0,
  'NPR',
  50000,
  35000,
  20000,
  15000,
  'Buy drinking water for Camp A',
  'In Use',
  0,
  0,
  120,
  '[{"key":"pledged","label":"Donation received"},{"key":"verified","label":"Payment verified"},{"key":"allocated","label":"Allocated to Camp A water need"}]'::jsonb,
  false
from public.users u
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
join public.relief_needs n on n.camp_id = c.id and n.item_name = 'Drinking Water'
where u.email = 'donor.demo@rahat.test'
on conflict (donation_id) do update
set status = excluded.status,
    used_amount = excluded.used_amount,
    people_supported = excluded.people_supported,
    is_demo = false,
    updated_at = now();

insert into public.donations (
  donation_id, kind, donor_name, donor_email, donor_user_id, camp_id, relief_need_id,
  item_name, quantity, unit, pledged_quantity, received_quantity, purpose, status, people_supported, timeline, is_demo
)
select
  'RAHAT-SUP-000001',
  'Physical',
  'Valley Mutual Aid Donor',
  'donor.demo@rahat.test',
  u.id,
  c.id,
  n.id,
  'Rice',
  100,
  'kg',
  100,
  100,
  'Rice for Camp A kitchen',
  'Received',
  80,
  '[{"key":"pledged","label":"Supplies pledged"},{"key":"received","label":"Received at Camp A"}]'::jsonb,
  false
from public.users u
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
join public.relief_needs n on n.camp_id = c.id and n.item_name = 'Rice'
where u.email = 'donor.demo@rahat.test'
on conflict (donation_id) do update
set status = excluded.status,
    received_quantity = excluded.received_quantity,
    is_demo = false,
    updated_at = now();

insert into public.donation_allocations (allocation_id, donation_id, need_id, camp_id, item_name, amount_npr, quantity, reason, allocated_by)
select
  'ALC-2026-0001',
  d.id,
  n.id,
  c.id,
  'Drinking Water',
  35000,
  3500,
  'Critical drinking-water shortage at Camp A',
  u.id
from public.donations d
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
join public.relief_needs n on n.camp_id = c.id and n.item_name = 'Drinking Water'
join public.users u on u.email = 'admin@rahat.gov.np'
where d.donation_id = 'RAHAT-DON-000001'
on conflict (allocation_id) do nothing;

insert into public.donation_allocations (allocation_id, donation_id, need_id, camp_id, item_name, amount_npr, quantity, reason, allocated_by)
select
  'ALC-2026-0002',
  d.id,
  n.id,
  c.id,
  'Rice',
  0,
  100,
  'Kitchen stock below two-day supply',
  u.id
from public.donations d
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
join public.relief_needs n on n.camp_id = c.id and n.item_name = 'Rice'
join public.users u on u.email = 'admin@rahat.gov.np'
where d.donation_id = 'RAHAT-SUP-000001'
on conflict (allocation_id) do nothing;

insert into public.impact_records (
  donation_id, camp_id, item_name, amount_used_npr, quantity_delivered, unit, people_supported, location, verified_by, verified_at, notes, donor_facing, proofs
)
select
  d.id,
  c.id,
  'Drinking Water',
  20000,
  2000,
  'L',
  120,
  'Camp A — Bhaktapur Emergency Shelter',
  u.id,
  now(),
  'Water purchased locally and distributed to 120 people.',
  true,
  '[{"kind":"note","caption":"Distribution recorded by camp official","donorFacing":true}]'::jsonb
from public.donations d
join public.relief_camps c on c.camp_id = 'CAMP-2026-0001'
join public.users u on u.email = 'admin@rahat.gov.np'
where d.donation_id = 'RAHAT-DON-000001'
  and not exists (
    select 1 from public.impact_records i where i.donation_id = d.id
  );

insert into public.notifications (user_id, audience, role, title, body, type, related_model, related_id)
select
  u.id,
  'user',
  '',
  'Your donation reached Camp A',
  'NPR 20,000 of your water donation was used at Camp A. 120 people received drinking water.',
  'impact_recorded',
  'Donation',
  'RAHAT-DON-000001'
from public.users u
where u.email = 'donor.demo@rahat.test'
  and not exists (
    select 1 from public.notifications n
    where n.user_id = u.id and n.title = 'Your donation reached Camp A'
  );

insert into public.notifications (audience, role, title, body, type)
select 'role', 'admin', 'New verified need published', 'Camp A published a critical drinking-water shortage.', 'system'
where not exists (
  select 1 from public.notifications n where n.title = 'New verified need published'
);

insert into public.audit_logs (user_id, actor_name, role, action, entity_type, entity_id, metadata)
select
  id,
  'RAHAT System Administrator',
  'admin',
  'Seeded Supabase tables',
  'System',
  'supabase-seed',
  '{"source":"seed.sql"}'::jsonb
from public.users
where email = 'admin@rahat.gov.np';

insert into public.contact_messages (name, email, subject, message)
select 'Kamala Joshi', 'helpdesk-test@rahat.test', 'How can our ward committee donate rice?', 'We can send 200 kg of rice this week. Which camp should receive it?'
where not exists (
  select 1 from public.contact_messages c where c.email = 'helpdesk-test@rahat.test'
);

insert into public.app_meta (key, value)
values
  ('product', 'RAHAT'),
  ('schema', 'rahat_core'),
  ('seeded_at', now()::text)
on conflict (key) do update set value = excluded.value, updated_at = now();
