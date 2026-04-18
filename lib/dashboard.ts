import { churches } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReviewerQueueItem = {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  status: string;
  submittedAt: string;
  region: string;
};

export type ReviewerDashboardData = {
  queue: ReviewerQueueItem[];
  myRegions: string[];
  myInvitesRemaining: number;
  myRatings: number;
  inviteTreeCount: number;
};

export type AdminDashboardData = {
  pendingSubmissions: ReviewerQueueItem[];
  reviewerCount: number;
  regionalAdminCount: number;
  openReports: number;
  pendingInvites: number;
};

const mockQueue: ReviewerQueueItem[] = [
  {
    id: "sub-vienna-001",
    name: "Dominikanerkirche",
    city: "Vienna",
    countryCode: "AT",
    status: "pending",
    submittedAt: "2026-04-18T09:00:00.000Z",
    region: "AT-9",
  },
  {
    id: "sub-rome-001",
    name: "San Clemente",
    city: "Rome",
    countryCode: "IT",
    status: "partially_approved",
    submittedAt: "2026-04-17T14:30:00.000Z",
    region: "IT-RM",
  },
];

export async function getReviewerDashboardData(): Promise<ReviewerDashboardData> {
  if (!hasSupabaseEnv()) {
    return {
      queue: mockQueue,
      myRegions: ["AT-9", "IT-RM"],
      myInvitesRemaining: 3,
      myRatings: 18,
      inviteTreeCount: 5,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { queue: [], myRegions: [], myInvitesRemaining: 0, myRatings: 0, inviteTreeCount: 0 };
  }

  const [regionsResult, profileResult, ratingsResult, submissionsResult, invitesResult] = await Promise.all([
    supabase.from("reviewer_regions").select("country_code,subdivision_code,is_global_scope").eq("user_id", user.id),
    supabase.from("profiles").select("reviewer_invite_quota").eq("id", user.id).maybeSingle(),
    supabase.from("ratings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("church_submissions").select("id,church_name,city,country_code,status,created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("invite_tokens").select("id", { count: "exact", head: true }).eq("invited_by", user.id),
  ]);

  const myRegions = (regionsResult.data ?? []).map((region) =>
    region.is_global_scope ? "Global" : region.subdivision_code ?? region.country_code ?? "Unassigned",
  );

  return {
    queue: (submissionsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.church_name,
      city: item.city,
      countryCode: item.country_code,
      status: item.status,
      submittedAt: item.created_at,
      region: item.country_code,
    })),
    myRegions,
    myInvitesRemaining: profileResult.data?.reviewer_invite_quota ?? 0,
    myRatings: ratingsResult.count ?? 0,
    inviteTreeCount: invitesResult.count ?? 0,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!hasSupabaseEnv()) {
    return {
      pendingSubmissions: mockQueue,
      reviewerCount: 12,
      regionalAdminCount: 4,
      openReports: 3,
      pendingInvites: 7,
    };
  }

  const supabase = await createServerSupabaseClient();
  const [submissionsResult, reviewerCountResult, regionalAdminCountResult, reportsResult, invitesResult] = await Promise.all([
    supabase.from("church_submissions").select("id,church_name,city,country_code,status,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "reviewer"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "regional_admin"),
    supabase.from("reports").select("id", { count: "exact", head: true }),
    supabase.from("invite_tokens").select("id", { count: "exact", head: true }).is("redeemed_at", null),
  ]);

  return {
    pendingSubmissions: (submissionsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.church_name,
      city: item.city,
      countryCode: item.country_code,
      status: item.status,
      submittedAt: item.created_at,
      region: item.country_code,
    })),
    reviewerCount: reviewerCountResult.count ?? 0,
    regionalAdminCount: regionalAdminCountResult.count ?? 0,
    openReports: reportsResult.count ?? 0,
    pendingInvites: invitesResult.count ?? 0,
  };
}

export function getArchiveOverviewStats() {
  return {
    cityCount: new Set(churches.map((church) => church.city)).size,
    churchCount: churches.length,
    averageScore:
      Math.round((churches.reduce((sum, church) => sum + church.ratings.overall, 0) / churches.length) * 10) / 10,
  };
}
