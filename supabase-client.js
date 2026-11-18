import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Add the real Project URL and Publishable key from Supabase Dashboard
// Settings -> API. Never put the secret/service_role key in this file.
export const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
export const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce"
  }
});

export const APP_BASE_URL = new URL("./", import.meta.url).href;
export const AUTH_RETURN_URL = new URL("index.html", import.meta.url).href;
