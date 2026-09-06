const { createClient } = require('@supabase/supabase-js');

let client;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  return { url, secretKey, publishableKey, key: secretKey || publishableKey };
}

function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    const { url, key } = getSupabaseConfig();
    client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}

async function pingSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    return { configured: false, ok: false, message: 'Supabase env vars are missing' };
  }

  const { data, error } = await supabase.from('app_meta').select('key, value').limit(4);
  if (error) {
    return { configured: true, ok: false, message: error.message };
  }
  return { configured: true, ok: true, message: 'Supabase connected', meta: data };
}

module.exports = {
  getSupabase,
  isSupabaseConfigured,
  pingSupabase,
};
