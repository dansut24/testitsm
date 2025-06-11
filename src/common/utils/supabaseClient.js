import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ciilmjntkujdhxtsmsho.supabase.co"; // ✅ replace if needed
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaWxtam50a3VqZGh4dHNtc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjUyODYsImV4cCI6MjA2NDIwMTI4Nn0.IgP77aJA-PCRMkZjbTaTEUkje_e1bA9ZP73SVDHPXhA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
