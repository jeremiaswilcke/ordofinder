import { createHash, randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_RX = /^[A-Z2-9]{12}$/;

export function generateAccessCode(): string {
  const buf = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

export function normalizeAccessCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z2-9]/g, "");
}

export function hashAccessCode(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

export type AccessCodeRecord = {
  id: string;
  label: string | null;
  role: UserRole;
  country_code: string | null;
  subdivision_code: string | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
};

type CreateInput = {
  createdBy: string;
  label?: string | null;
  maxUses?: number | null;
  countryCode?: string | null;
  subdivisionCode?: string | null;
  expiresAt?: string | null;
  role?: UserRole;
};

export async function createAccessCode(input: CreateInput): Promise<{
  plain: string;
  record: AccessCodeRecord;
}> {
  const plain = generateAccessCode();
  const hash = hashAccessCode(normalizeAccessCode(plain));
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("access_codes")
    .insert({
      code_hash: hash,
      label: input.label?.trim() || null,
      role: input.role ?? "reviewer",
      country_code: input.countryCode || null,
      subdivision_code: input.subdivisionCode || null,
      max_uses: input.maxUses ?? null,
      expires_at: input.expiresAt || null,
      created_by: input.createdBy,
    })
    .select(
      "id,label,role,country_code,subdivision_code,max_uses,uses_count,expires_at,created_at",
    )
    .single();

  if (error || !data) throw new Error(error?.message ?? "code_create_failed");
  return { plain, record: data as AccessCodeRecord };
}

export async function listAccessCodesCreatedBy(userId: string): Promise<AccessCodeRecord[]> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("access_codes")
    .select(
      "id,label,role,country_code,subdivision_code,max_uses,uses_count,expires_at,created_at",
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as AccessCodeRecord[];
}

export async function redeemAccessCode(plain: string, userId: string): Promise<{ role: UserRole }> {
  const normalized = normalizeAccessCode(plain);
  if (!CODE_RX.test(normalized)) throw new Error("code_invalid_format");

  const supabase = createAdminSupabaseClient();
  const { data: code, error } = await supabase
    .from("access_codes")
    .select("id,role,country_code,subdivision_code,max_uses,uses_count,expires_at")
    .eq("code_hash", hashAccessCode(normalized))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!code) throw new Error("code_not_found");
  if (code.expires_at && new Date(code.expires_at).getTime() < Date.now()) {
    throw new Error("code_expired");
  }
  if (code.max_uses !== null && code.uses_count >= code.max_uses) {
    throw new Error("code_exhausted");
  }

  const { data: already } = await supabase
    .from("access_code_redemptions")
    .select("id")
    .eq("code_id", code.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (already) throw new Error("code_already_redeemed");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: code.role })
    .eq("id", userId);
  if (profileError) throw new Error(profileError.message);

  if (code.country_code || code.subdivision_code) {
    const { error: regionError } = await supabase.from("reviewer_regions").insert({
      user_id: userId,
      country_code: code.country_code,
      subdivision_code: code.subdivision_code,
      is_global_scope: false,
    });
    if (regionError) throw new Error(regionError.message);
  }

  const { error: redemptionError } = await supabase
    .from("access_code_redemptions")
    .insert({ code_id: code.id, user_id: userId });
  if (redemptionError) throw new Error(redemptionError.message);

  const { error: bumpError } = await supabase
    .from("access_codes")
    .update({ uses_count: code.uses_count + 1 })
    .eq("id", code.id);
  if (bumpError) throw new Error(bumpError.message);

  return { role: code.role as UserRole };
}
