require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function must(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function tablesReady() {
  const { error } = await supabase.from('app_meta').select('key').limit(1);
  return !error;
}

function projectRef() {
  const match = String(url || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] || 'fqsvktaebjhxvsgpkpzw';
}

function postgresTargets() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = projectRef();
  const encoded = encodeURIComponent(password);
  const hosts = [
    process.env.SUPABASE_DB_HOST,
    `db.${ref}.supabase.co`,
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-1-ap-southeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-1-us-east-1.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
  ].filter(Boolean);

  const targets = [];
  for (const host of hosts) {
    const isPooler = host.includes('pooler.supabase.com');
    const user = isPooler ? `postgres.${ref}` : 'postgres';
    const ports = isPooler ? [6543, 5432] : [5432];
    for (const port of ports) {
      targets.push({
        host,
        port,
        user,
        password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionString: `postgresql://${user}:${encoded}@${host}:${port}/postgres`,
      });
    }
  }
  return targets;
}

async function runSql(sql) {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    throw new Error('SUPABASE_DB_PASSWORD is missing from server/.env');
  }

  let lastError;
  for (const target of postgresTargets()) {
    const client = new Client({
      host: target.host,
      port: target.port,
      user: target.user,
      password: target.password,
      database: target.database,
      ssl: target.ssl,
      connectionTimeoutMillis: 8000,
    });
    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log(`Connected to Postgres at ${target.host}:${target.port}`);
      return;
    } catch (error) {
      lastError = error;
      try { await client.end(); } catch { /* ignore */ }
    }
  }
  throw new Error(`Could not reach Supabase Postgres: ${lastError?.message || 'unknown error'}`);
}

async function applySchemaIfNeeded() {
  if (await tablesReady()) {
    console.log('RAHAT tables already exist.');
    return;
  }

  const migration = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20260906110710_rahat_core.sql');
  const sql = fs.readFileSync(migration, 'utf8');
  console.log('Creating RAHAT tables from migration…');
  await runSql(sql);
  console.log('Schema applied.');
}

async function seed() {
  await applySchemaIfNeeded();

  const passwordHash = await bcrypt.hash('RahatAdmin@2026', 12);
  const officialHash = await bcrypt.hash('CampOfficial@2026', 12);
  const donorHash = await bcrypt.hash('DonorDemo@2026', 12);
  const authorityHash = await bcrypt.hash('Authority@2026', 12);

  const users = await must(
    'users',
    await supabase.from('users').upsert(
      [
        {
          email: 'admin@rahat.gov.np',
          password_hash: passwordHash,
          role: 'admin',
          full_name: 'RAHAT System Administrator',
          is_active: true,
        },
        {
          email: 'donor.demo@rahat.test',
          password_hash: donorHash,
          role: 'donor',
          full_name: 'Valley Mutual Aid Donor',
          is_active: true,
        },
        {
          email: 'authority.suryabinayak@rahat.gov.np',
          password_hash: authorityHash,
          role: 'local_authority',
          full_name: 'Suryabinayak LDMC Officer',
          is_active: true,
        },
        {
          email: 'official.a@rahat.gov.np',
          password_hash: officialHash,
          role: 'camp_official',
          full_name: 'Bimala Tamang',
          is_active: true,
        },
      ],
      { onConflict: 'email' }
    ).select()
  );

  const byEmail = Object.fromEntries(users.map((row) => [row.email, row]));

  const disasters = await must(
    'disasters',
    await supabase.from('disasters').upsert(
      [
        {
          disaster_id: 'DIS-2026-0001',
          name: 'Suryabinayak monsoon flood',
          type: 'Flood',
          location: 'Hanumante corridor, Suryabinayak',
          district: 'Bhaktapur',
          municipality: 'Suryabinayak Municipality',
          ward: '6',
          occurred_on: '2026-09-04',
          severity: 'High',
          description: 'Verified local flood affecting wards 5, 6 and 7. Relief is coordinated through published camp needs.',
          affected_wards: ['5', '6', '7'],
          expected_population: 2840,
          disaster_level: 3,
          status: 'Active',
          is_public: true,
          is_demo: false,
        },
      ],
      { onConflict: 'disaster_id' }
    ).select()
  );
  const disaster = disasters[0];

  await must(
    'local_authorities',
    await supabase.from('local_authorities').upsert(
      [
        {
          user_id: byEmail['authority.suryabinayak@rahat.gov.np'].id,
          title: 'Local Disaster Management Officer',
          province: 'Bagmati',
          district: 'Bhaktapur',
          municipality: 'Suryabinayak Municipality',
          wards: ['5', '6', '7'],
          contact_phone: '01-6612345',
          is_demo: false,
        },
      ],
      { onConflict: 'user_id' }
    )
  );

  const camps = await must(
    'relief_camps',
    await supabase.from('relief_camps').upsert(
      [
        {
          camp_id: 'CAMP-2026-0001',
          name: 'Camp A — Bhaktapur Emergency Shelter',
          location: 'Suryabinayak Ground, Bhaktapur',
          district: 'Bhaktapur',
          municipality: 'Suryabinayak Municipality',
          ward: '4',
          camp_head: 'Bimala Tamang',
          contact_phone: '01-6611001',
          contact_email: 'camp.a@rahat.gov.np',
          capacity: 1000,
          current_population: 186,
          disaster_id: disaster.id,
          camp_status: 'Active',
          is_active: true,
          is_demo: false,
          notes: 'Primary shelter for wards 5–7.',
        },
        {
          camp_id: 'CAMP-2026-0002',
          name: 'Camp B — Kathmandu Central Relief Camp',
          location: 'Tundikhel Coordination Area, Kathmandu',
          district: 'Kathmandu',
          municipality: 'Kathmandu Metropolitan City',
          ward: '11',
          camp_head: 'Prakash Adhikari',
          contact_phone: '01-4211002',
          contact_email: 'camp.b@rahat.gov.np',
          capacity: 1500,
          current_population: 420,
          disaster_id: disaster.id,
          camp_status: 'Active',
          is_active: true,
          is_demo: false,
          notes: 'Overflow and medical staging camp.',
        },
      ],
      { onConflict: 'camp_id' }
    ).select()
  );
  const campA = camps.find((row) => row.camp_id === 'CAMP-2026-0001');
  const campB = camps.find((row) => row.camp_id === 'CAMP-2026-0002');

  await must(
    'camp_officials',
    await supabase.from('camp_officials').upsert(
      [
        {
          user_id: byEmail['official.a@rahat.gov.np'].id,
          official_id: 'OFF-2026-0001',
          full_name: 'Bimala Tamang',
          assigned_camp_id: campA.id,
          phone: '9800000001',
          designation: 'Camp Coordination Officer',
          is_active: true,
          is_demo: false,
        },
      ],
      { onConflict: 'official_id' }
    )
  );

  const inventoryRows = [
    { camp_id: campA.id, item_name: 'Drinking Water', current_qty: 1200, required_qty: 8000, incoming_qty: 500, unit: 'L', priority: 'CRITICAL', priority_reason: 'Daily use exceeds stock' },
    { camp_id: campA.id, item_name: 'Rice', current_qty: 80, required_qty: 400, incoming_qty: 0, unit: 'kg', priority: 'CRITICAL', priority_reason: 'Less than two days of supply' },
    { camp_id: campA.id, item_name: 'Blankets', current_qty: 90, required_qty: 320, incoming_qty: 40, unit: 'units', priority: 'HIGH', priority_reason: 'Night temperature dropping' },
    { camp_id: campA.id, item_name: 'Medicines', current_qty: 25, required_qty: 180, incoming_qty: 0, unit: 'kits', priority: 'CRITICAL', priority_reason: 'Clinic stock nearly empty' },
    { camp_id: campB.id, item_name: 'Hygiene Kits', current_qty: 40, required_qty: 200, incoming_qty: 20, unit: 'kits', priority: 'HIGH', priority_reason: 'New arrivals this week' },
    { camp_id: campB.id, item_name: 'Baby Food', current_qty: 12, required_qty: 80, incoming_qty: 0, unit: 'packs', priority: 'CRITICAL', priority_reason: 'Infants in camp B' },
  ];

  await supabase.from('camp_inventory').delete().in('camp_id', [campA.id, campB.id]);
  const inventory = await must('camp_inventory', await supabase.from('camp_inventory').insert(inventoryRows).select());

  await supabase.from('relief_needs').delete().in('camp_id', [campA.id, campB.id]);
  const needs = await must(
    'relief_needs',
    await supabase.from('relief_needs').insert(
      inventory.map((item) => ({
        camp_id: item.camp_id,
        inventory_id: item.id,
        item_name: item.item_name,
        available_qty: item.current_qty,
        required_qty: item.required_qty,
        shortage: Math.max(0, Number(item.required_qty) - Number(item.current_qty)),
        projected_shortage: Math.max(0, Number(item.required_qty) - Number(item.current_qty) - Number(item.incoming_qty || 0)),
        unit: item.unit,
        priority: item.priority,
        priority_reason: item.priority_reason,
        is_published: true,
      }))
    ).select()
  );
  const waterNeed = needs.find((row) => row.item_name === 'Drinking Water');
  const riceNeed = needs.find((row) => row.item_name === 'Rice');

  const donations = await must(
    'donations',
    await supabase.from('donations').upsert(
      [
        {
          donation_id: 'RAHAT-DON-000001',
          kind: 'Money',
          donor_name: 'Valley Mutual Aid Donor',
          donor_email: 'donor.demo@rahat.test',
          donor_phone: '9801111222',
          donor_user_id: byEmail['donor.demo@rahat.test'].id,
          donor_type: 'Community Organization',
          camp_id: campA.id,
          relief_need_id: waterNeed?.id || null,
          item_name: 'Drinking Water',
          quantity: 0,
          unit: 'NPR',
          amount_npr: 50000,
          allocated_amount: 35000,
          used_amount: 20000,
          remaining_amount: 15000,
          purpose: 'Buy drinking water for Camp A',
          status: 'In Use',
          pledged_quantity: 0,
          received_quantity: 0,
          people_supported: 120,
          timeline: [
            { key: 'pledged', label: 'Donation received', at: '2026-09-05T08:00:00.000Z' },
            { key: 'verified', label: 'Payment verified', at: '2026-09-05T10:00:00.000Z' },
            { key: 'allocated', label: 'Allocated to Camp A water need', at: '2026-09-05T12:00:00.000Z' },
          ],
          is_demo: false,
        },
        {
          donation_id: 'RAHAT-SUP-000001',
          kind: 'Physical',
          donor_name: 'Valley Mutual Aid Donor',
          donor_email: 'donor.demo@rahat.test',
          donor_phone: '9801111222',
          donor_user_id: byEmail['donor.demo@rahat.test'].id,
          donor_type: 'Community Organization',
          camp_id: campA.id,
          relief_need_id: riceNeed?.id || null,
          item_name: 'Rice',
          quantity: 100,
          unit: 'kg',
          amount_npr: 0,
          allocated_amount: 0,
          used_amount: 0,
          remaining_amount: 0,
          pledged_quantity: 100,
          received_quantity: 100,
          purpose: 'Rice for Camp A kitchen',
          status: 'Received',
          people_supported: 80,
          timeline: [
            { key: 'pledged', label: 'Supplies pledged', at: '2026-09-05T09:00:00.000Z' },
            { key: 'received', label: 'Received at Camp A', at: '2026-09-06T07:30:00.000Z' },
          ],
          is_demo: false,
        },
      ],
      { onConflict: 'donation_id' }
    ).select()
  );
  const money = donations.find((row) => row.donation_id === 'RAHAT-DON-000001');
  const rice = donations.find((row) => row.donation_id === 'RAHAT-SUP-000001');

  await supabase.from('donation_allocations').delete().in('donation_id', [money.id, rice.id]);
  await must(
    'donation_allocations',
    await supabase.from('donation_allocations').insert([
      {
        allocation_id: 'ALC-2026-0001',
        donation_id: money.id,
        need_id: waterNeed?.id || null,
        camp_id: campA.id,
        item_name: 'Drinking Water',
        amount_npr: 35000,
        quantity: 3500,
        reason: 'Critical drinking-water shortage at Camp A',
        allocated_by: byEmail['admin@rahat.gov.np'].id,
      },
      {
        allocation_id: 'ALC-2026-0002',
        donation_id: rice.id,
        need_id: riceNeed?.id || null,
        camp_id: campA.id,
        item_name: 'Rice',
        amount_npr: 0,
        quantity: 100,
        reason: 'Kitchen stock below two-day supply',
        allocated_by: byEmail['admin@rahat.gov.np'].id,
      },
    ])
  );

  await supabase.from('impact_records').delete().eq('donation_id', money.id);
  await must(
    'impact_records',
    await supabase.from('impact_records').insert([
      {
        donation_id: money.id,
        camp_id: campA.id,
        item_name: 'Drinking Water',
        amount_used_npr: 20000,
        quantity_delivered: 2000,
        unit: 'L',
        people_supported: 120,
        location: 'Camp A — Bhaktapur Emergency Shelter',
        verified_by: byEmail['admin@rahat.gov.np'].id,
        verified_at: new Date().toISOString(),
        notes: 'Water purchased locally and distributed to 120 people.',
        donor_facing: true,
        proofs: [{ kind: 'note', caption: 'Distribution recorded by camp official', donorFacing: true }],
      },
    ])
  );

  await supabase.from('notifications').delete().eq('title', 'Your donation reached Camp A');
  await must(
    'notifications',
    await supabase.from('notifications').insert([
      {
        user_id: byEmail['donor.demo@rahat.test'].id,
        audience: 'user',
        role: '',
        title: 'Your donation reached Camp A',
        body: 'NPR 20,000 of your water donation was used at Camp A. 120 people received drinking water.',
        type: 'impact_recorded',
        related_model: 'Donation',
        related_id: money.donation_id,
      },
      {
        audience: 'role',
        role: 'admin',
        title: 'New verified need published',
        body: 'Camp A published a critical drinking-water shortage.',
        type: 'system',
        related_model: '',
        related_id: '',
      },
    ])
  );

  await must(
    'audit_logs',
    await supabase.from('audit_logs').insert([
      {
        user_id: byEmail['admin@rahat.gov.np'].id,
        actor_name: 'RAHAT System Administrator',
        role: 'admin',
        action: 'Seeded Supabase tables',
        entity_type: 'System',
        entity_id: 'supabase-seed',
        metadata: { tables: ['users', 'disasters', 'relief_camps', 'relief_needs', 'donations'] },
      },
    ])
  );

  await supabase.from('contact_messages').delete().eq('email', 'helpdesk-test@rahat.test');
  await must(
    'contact_messages',
    await supabase.from('contact_messages').insert([
      {
        name: 'Kamala Joshi',
        email: 'helpdesk-test@rahat.test',
        subject: 'How can our ward committee donate rice?',
        message: 'We can send 200 kg of rice this week. Which camp should receive it?',
      },
    ])
  );

  await must(
    'app_meta',
    await supabase.from('app_meta').upsert([
      { key: 'product', value: 'RAHAT' },
      { key: 'schema', value: 'rahat_core' },
      { key: 'seeded_at', value: new Date().toISOString() },
    ])
  );

  const counts = {};
  for (const table of [
    'users',
    'local_authorities',
    'disasters',
    'relief_camps',
    'camp_officials',
    'camp_inventory',
    'relief_needs',
    'donations',
    'donation_allocations',
    'impact_records',
    'notifications',
    'audit_logs',
    'contact_messages',
    'app_meta',
  ]) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) throw new Error(`${table} count: ${error.message}`);
    counts[table] = count;
  }

  console.log('Supabase seed complete.');
  console.table(counts);
}

seed().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
