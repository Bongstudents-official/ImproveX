// supabase.js

// Initialize Supabase configuration using Publishable (Anon) Key
const SUPABASE_URL = 'https://otctvgghfrprztywwuhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6aH1QSGA5fP2G4rbDJEFhg_MnkmIPDd';

// Instantiate client if SDK is available
if (typeof supabase !== 'undefined' && supabase.createClient) {
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.error("Supabase SDK CDN is missing or loaded out of order.");
}
