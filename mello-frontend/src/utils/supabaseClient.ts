import { createClient } from "@supabase/supabase-js";

// ✅ Nejdřív načti proměnné
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Pak teprve loguj
console.log("✅ Supabase URL:", supabaseUrl);
console.log("✅ Supabase Key:", supabaseAnonKey?.slice(0, 12) + "...");

// ⚠️ Pokud něco chybí, vyhoď chybu
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL nebo klíč chybí. Zkontroluj .env soubor.");
}

// ✅ Nakonec vytvoř klienta
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
