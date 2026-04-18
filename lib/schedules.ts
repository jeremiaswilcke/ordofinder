import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type MassTimeRow = {
  id: string;
  weekday: number;
  startTime: string;
  languageCode: string;
  rite: string;
  form: string;
  notes: string | null;
  createdBy: string | null;
};

export type ConfessionTimeRow = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string | null;
  languageCode: string | null;
  notes: string | null;
  createdBy: string | null;
};

export type ChurchScheduleContext = {
  churchId: string;
  churchName: string;
  city: string;
  slug: string;
  masses: MassTimeRow[];
  confessions: ConfessionTimeRow[];
};

export async function getChurchScheduleBySlug(
  slug: string
): Promise<ChurchScheduleContext | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createAdminSupabaseClient();
  // Wichtig: nur approved Kirchen herausgeben. Der Admin-Client bypasst RLS,
  // deshalb muss der Filter explizit sein, sonst leaken pending/rejected
  // Kirchen ueber einen erratenen Slug.
  const { data: church } = await supabase
    .from("churches")
    .select("id,name,city,slug")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (!church) return null;

  const [masses, confessions] = await Promise.all([
    supabase
      .from("mass_times")
      .select("id,weekday,start_time,language_code,rite,form,notes,created_by")
      .eq("church_id", church.id)
      .order("weekday")
      .order("start_time"),
    supabase
      .from("confession_times")
      .select("id,weekday,start_time,end_time,language_code,notes,created_by")
      .eq("church_id", church.id)
      .order("weekday")
      .order("start_time"),
  ]);

  return {
    churchId: church.id,
    churchName: church.name,
    city: church.city,
    slug: church.slug,
    masses: ((masses.data ?? []) as Array<{
      id: string;
      weekday: number;
      start_time: string;
      language_code: string;
      rite: string;
      form: string;
      notes: string | null;
      created_by: string | null;
    }>).map((m) => ({
      id: m.id,
      weekday: m.weekday,
      startTime: m.start_time.slice(0, 5),
      languageCode: m.language_code,
      rite: m.rite,
      form: m.form,
      notes: m.notes,
      createdBy: m.created_by,
    })),
    confessions: ((confessions.data ?? []) as Array<{
      id: string;
      weekday: number;
      start_time: string;
      end_time: string | null;
      language_code: string | null;
      notes: string | null;
      created_by: string | null;
    }>).map((c) => ({
      id: c.id,
      weekday: c.weekday,
      startTime: c.start_time.slice(0, 5),
      endTime: c.end_time ? c.end_time.slice(0, 5) : null,
      languageCode: c.language_code,
      notes: c.notes,
      createdBy: c.created_by,
    })),
  };
}
