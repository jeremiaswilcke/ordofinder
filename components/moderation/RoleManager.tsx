"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ProfileListItem } from "@/lib/moderation";
import type { UserRole } from "@/lib/auth";

type Props = {
  initialProfiles: ProfileListItem[];
  actorRole: UserRole;
  actorUserId: string;
};

function allowedTargets(actor: UserRole): UserRole[] {
  if (actor === "global_admin") {
    return ["reviewer", "senior_reviewer", "regional_admin", "global_admin"];
  }
  if (actor === "regional_admin") {
    return ["reviewer", "senior_reviewer"];
  }
  if (actor === "senior_reviewer") {
    return ["reviewer"];
  }
  return [];
}

export function RoleManager({
  initialProfiles,
  actorRole,
  actorUserId,
}: Props) {
  const t = useTranslations("moderation");
  const [profiles, setProfiles] = React.useState(initialProfiles);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const targetOptions = allowedTargets(actorRole);

  const roleLabel: Record<string, string> = {
    null: t("rolesRoleNull"),
    reviewer: t("rolesRoleReviewer"),
    senior_reviewer: t("rolesRoleSenior"),
    regional_admin: t("rolesRoleRegional"),
    global_admin: t("rolesRoleGlobal"),
  };

  async function setRole(userId: string, newRole: UserRole | null) {
    setBusyId(userId);
    setErrors((e) => ({ ...e, [userId]: "" }));
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: userId,
          newRole,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `http_${res.status}`);
      }
      setProfiles((list) =>
        list.map((p) => (p.userId === userId ? { ...p, role: newRole } : p))
      );
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [userId]: err instanceof Error ? err.message : "unknown",
      }));
    } finally {
      setBusyId(null);
    }
  }

  if (profiles.length === 0) {
    return (
      <p className="rounded-lg bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-archival">
        {t("rolesEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {profiles.map((p) => {
        const isSelf = p.userId === actorUserId;
        const currentRoleLabel = roleLabel[p.role ?? "null"];
        return (
          <article
            key={p.userId}
            className="rounded-lg bg-surface-container-lowest p-5 shadow-archival"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-headline text-lg text-on-surface">
                  {p.displayName ?? t("rolesAnonymous")}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {currentRoleLabel}
                  {p.countryCodes.length > 0 &&
                    ` · ${p.countryCodes.join(", ")}`}
                  {p.subdivisionCodes.length > 0 &&
                    ` · ${p.subdivisionCodes.join(", ")}`}
                </p>
              </div>

              {!isSelf && (
                <div className="flex flex-wrap gap-2">
                  {targetOptions.map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={busyId === p.userId || p.role === role}
                      onClick={() => setRole(p.userId, role)}
                      className="rounded border border-outline/60 bg-surface px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-on-surface transition hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      → {role.replace("_", " ")}
                    </button>
                  ))}
                  {p.role !== null && (
                    <button
                      type="button"
                      disabled={busyId === p.userId}
                      onClick={() => setRole(p.userId, null)}
                      className="rounded border border-outline/60 bg-surface px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-on-surface transition hover:border-error hover:text-error disabled:opacity-40"
                    >
                      {t("rolesRevoke")}
                    </button>
                  )}
                </div>
              )}

              {isSelf && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-outline">
                  {t("rolesSelf")}
                </span>
              )}
            </div>
            {errors[p.userId] && (
              <p className="mt-2 text-xs text-error">
                {t("errorPrefix")} {errors[p.userId]}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
