// Supabase project connection details.
// The publishable/anon key is safe to expose in frontend code —
// Row Level Security (set up in schema.sql) controls what it can actually do.

const SUPABASE_URL = "https://izwwrhoqxhwabshrwvjt.supabase.co";
const SUPABASE_KEY = "sb_publishable_1Dif86VonHEABxTtw6A4bA_QuGvRIEi";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
