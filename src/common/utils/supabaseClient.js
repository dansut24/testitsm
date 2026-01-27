import { createClient } from "@supabase/supabase-js";
import { cookieStorage } from "./cookieStorage";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Cookie key shared across subdomains
const STORAGE_KEY = "hi5tech_sb_session";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY,
    storage: cookieStorage(STORAGE_KEY),
  },
});
