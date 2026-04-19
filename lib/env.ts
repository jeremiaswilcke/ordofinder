import { z } from "zod";

// --- Oeffentliche Defaults ---------------------------------------------------
// Diese beiden Werte sind bei Supabase bewusst oeffentlich. Die anon-Key ist
// per Design fuer Client-Bundles und durch Row-Level-Security auf der DB
// geschuetzt. Wir tragen sie hier als Fallback ein, damit die App auch ohne
// explizit gesetzte Vercel-Env-Vars laeuft. Eigene Werte in .env.local /
// Vercel-Env-Vars ueberschreiben diese Defaults problemlos.
const PUBLIC_SUPABASE_URL_DEFAULT = "https://ynmqyjbijivyuyiqbfbu.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY_DEFAULT =
  "sb_publishable_89azqmEH4jL5Afb1OwPSIQ_GRX7n0Lf";
// -----------------------------------------------------------------------------
// WICHTIG: SUPABASE_SERVICE_ROLE_KEY bleibt bewusst ohne Default und muss
// serverseitig als Env-Variable gesetzt werden. Dieser Key bypasst RLS und
// darf niemals ins Client-Bundle oder in den Quellcode gelangen.
// -----------------------------------------------------------------------------

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const parsed = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? PUBLIC_SUPABASE_URL_DEFAULT,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PUBLIC_SUPABASE_ANON_KEY_DEFAULT,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export const env = parsed;

export function hasSupabaseEnv() {
  return Boolean(parsed.NEXT_PUBLIC_SUPABASE_URL && parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
