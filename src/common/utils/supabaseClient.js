// common/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ciilmjntkujdhxtsmsho.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaWxtam50a3VqZGh4dHNtc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjUyODYsImV4cCI6MjA2NDIwMTI4Nn0.IgP77aJA-PCRMkZjbTaTEUkje_e1bA9ZP73SVDHPXhA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    cookies: {
      name: "sb-auth-token",
      domain: ".hi5tech.co.uk", // 🔑 enables cross-subdomain auth
      path: "/",
      sameSite: "Lax",
    },
  },
});
