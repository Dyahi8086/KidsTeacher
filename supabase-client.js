import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Browser-safe Supabase configuration. Never expose a secret/service_role key here.
export const SUPABASE_URL = "https://hhjaxjmlalnykfddvjew.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1hTA-grMQgKl9UBp1vI95A_xvBmHuRb";

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
