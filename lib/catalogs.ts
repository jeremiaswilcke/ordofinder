import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/env";

export type CountryOption = { code: string; name: string };
export type SubdivisionOption = { code: string; country_code: string; name: string };

export async function listCountries(): Promise<CountryOption[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("countries")
    .select("code,name")
    .order("name");
  return (data ?? []) as CountryOption[];
}

export async function listSubdivisions(): Promise<SubdivisionOption[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("subdivisions")
    .select("code,country_code,name")
    .order("name");
  return (data ?? []) as SubdivisionOption[];
}
