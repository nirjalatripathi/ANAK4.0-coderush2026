const mongoose = require('mongoose');
const { pingSupabase, isSupabaseConfigured } = require('./supabase');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not configured');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('RAHAT MongoDB connected');

  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured — add SUPABASE_URL and SUPABASE_SECRET_KEY to server/.env');
    return;
  }

  const status = await pingSupabase();
  if (status.ok) {
    console.log('RAHAT Supabase connected');
  } else {
    console.warn(`Supabase configured but unreachable: ${status.message}`);
  }
}

module.exports = connectDB;
