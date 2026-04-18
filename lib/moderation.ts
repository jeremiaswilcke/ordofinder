import { getCurrentProfile, type UserRole } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type ModerationTargetType = "church" | "rating" | "application";

export type ModerationQueueItem = {
  targetType: ModerationTargetType;
  targetId: string;
  status: string;
  createdAt: string;
  title: string;
  subtitle: string;
  createdBy?: string;
  // Wieviele Unterschriften sind schon da (ohne Ersteller), wieviel Gewicht gebraucht.
  signatures: Array<{
    actorId: string;
    actorDisplayName: string | null;
    actorRole: UserRole | null;
    action: "approve" | "reject";
    createdAt: string;
  }>;
};

type ChurchRow = {
  id: string;
  name: string;
  city: string;
  country_code: string;
  status: string;
  created_at: string;
  created_by: string | null;
};

type RatingRow = {
  id: string;
  church_id: string;
  user_id: string;
  liturgy_quality: number;
  music: number;
  homily_clarity: number;
  vibrancy: number;
  status: string;
  created_at: string;
};

type ApplicationRow = {
  id: string;
  user_id: string;
  display_name: string;
  about: string;
  motivation: string;
  preferred_country_code: string | null;
  preferred_subdivision_code: string | null;
  status: string;
  created_at: string;
};

export async function getModerationQueueForCurrentUser(limit = 40): Promise<
  ModerationQueueItem[]
> {
  if (!hasSupabaseEnv()) return [];
  const profile = await getCurrentProfile();
  if (!profile || !profile.role) return [];

  const supabase = createAdminSupabaseClient();

  const [churches, ratings, applications, actions] = await Promise.all([
    supabase
      .from("churches")
      .select("id,name,city,country_code,status,created_at,created_by")
      .in("status", ["pending", "partially_approved"])
      .order("created_at", { ascending: true })
      .limit(limit),
    supabase
      .from("ratings")
      .select("id,church_id,user_id,liturgy_quality,music,homily_clarity,vibrancy,status,created_at")
      .in("status", ["pending", "partially_approved"])
      .order("created_at", { ascending: true })
      .limit(limit),
    supabase
      .from("reviewer_applications")
      .select("id,user_id,display_name,about,motivation,preferred_country_code,preferred_subdivision_code,status,created_at")
      .in("status", ["pending", "partially_approved"])
      .order("created_at", { ascending: true })
      .limit(limit),
    supabase
      .from("moderation_actions")
      .select("target_type,target_id,actor_id,action,created_at,profiles(display_name,role)")
      .order("created_at", { ascending: true }),
  ]);

  const signaturesByTarget = new Map<
    string,
    ModerationQueueItem["signatures"]
  >();
  type ActionRow = {
    target_type: ModerationTargetType;
    target_id: string;
    actor_id: string;
    action: "approve" | "reject";
    created_at: string;
    profiles:
      | { display_name: string | null; role: UserRole | null }
      | Array<{ display_name: string | null; role: UserRole | null }>
      | null;
  };
  for (const row of ((actions.data ?? []) as unknown as ActionRow[])) {
    const joined = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const key = `${row.target_type}:${row.target_id}`;
    const list = signaturesByTarget.get(key) ?? [];
    list.push({
      actorId: row.actor_id,
      actorDisplayName: joined?.display_name ?? null,
      actorRole: joined?.role ?? null,
      action: row.action,
      createdAt: row.created_at,
    });
    signaturesByTarget.set(key, list);
  }

  const items: ModerationQueueItem[] = [];

  for (const c of (churches.data ?? []) as ChurchRow[]) {
    items.push({
      targetType: "church",
      targetId: c.id,
      status: c.status,
      createdAt: c.created_at,
      title: c.name,
      subtitle: `${c.city} · ${c.country_code}`,
      createdBy: c.created_by ?? undefined,
      signatures: signaturesByTarget.get(`church:${c.id}`) ?? [],
    });
  }

  if (ratings.data && ratings.data.length > 0) {
    const churchIds = Array.from(
      new Set((ratings.data as RatingRow[]).map((r) => r.church_id))
    );
    const { data: churchNames } = await supabase
      .from("churches")
      .select("id,name,city")
      .in("id", churchIds);
    const nameMap = new Map<string, { name: string; city: string }>();
    for (const c of (churchNames ?? []) as { id: string; name: string; city: string }[]) {
      nameMap.set(c.id, { name: c.name, city: c.city });
    }
    for (const r of ratings.data as RatingRow[]) {
      const ref = nameMap.get(r.church_id);
      items.push({
        targetType: "rating",
        targetId: r.id,
        status: r.status,
        createdAt: r.created_at,
        title: `Bewertung: ${ref?.name ?? "Kirche"}`,
        subtitle: `Liturgie ${r.liturgy_quality} · Musik ${r.music} · Predigt ${r.homily_clarity} · Vibrancy ${r.vibrancy}${ref ? ` · ${ref.city}` : ""}`,
        createdBy: r.user_id,
        signatures: signaturesByTarget.get(`rating:${r.id}`) ?? [],
      });
    }
  }

  for (const a of (applications.data ?? []) as ApplicationRow[]) {
    const scope = a.preferred_subdivision_code
      ? a.preferred_subdivision_code
      : a.preferred_country_code ?? "global";
    items.push({
      targetType: "application",
      targetId: a.id,
      status: a.status,
      createdAt: a.created_at,
      title: `Bewerbung: ${a.display_name}`,
      subtitle: `${scope} — ${a.motivation.slice(0, 120)}${a.motivation.length > 120 ? "…" : ""}`,
      createdBy: a.user_id,
      signatures: signaturesByTarget.get(`application:${a.id}`) ?? [],
    });
  }

  return items.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export type ProfileListItem = {
  userId: string;
  displayName: string | null;
  role: UserRole | null;
  countryCodes: string[];
  subdivisionCodes: string[];
  createdAt: string;
};

export async function listAllProfiles(): Promise<ProfileListItem[]> {
  if (!hasSupabaseEnv()) return [];
  const profile = await getCurrentProfile();
  if (!profile || !["regional_admin", "global_admin"].includes(profile.role ?? "")) {
    return [];
  }
  const supabase = createAdminSupabaseClient();
  const [{ data: profiles }, { data: regions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,role,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("reviewer_regions")
      .select("user_id,country_code,subdivision_code"),
  ]);

  const regionMap = new Map<string, { country: string[]; sub: string[] }>();
  for (const r of (regions ?? []) as Array<{
    user_id: string;
    country_code: string | null;
    subdivision_code: string | null;
  }>) {
    const bucket = regionMap.get(r.user_id) ?? { country: [], sub: [] };
    if (r.country_code) bucket.country.push(r.country_code);
    if (r.subdivision_code) bucket.sub.push(r.subdivision_code);
    regionMap.set(r.user_id, bucket);
  }

  return ((profiles ?? []) as Array<{
    id: string;
    display_name: string | null;
    role: UserRole | null;
    created_at: string;
  }>).map((p) => {
    const bucket = regionMap.get(p.id) ?? { country: [], sub: [] };
    return {
      userId: p.id,
      displayName: p.display_name,
      role: p.role,
      countryCodes: bucket.country,
      subdivisionCodes: bucket.sub,
      createdAt: p.created_at,
    };
  });
}
