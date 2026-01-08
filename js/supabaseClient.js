// FILE: js/supabaseClient.js
// Purpose: Initialize Supabase connection

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  window.__SUPABASE_URL__,       // Set in Vercel env
  window.__SUPABASE_ANON_KEY__   // Set in Vercel env
);
