"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ModerationQueueItem } from "@/lib/moderation";

type Props = {
  initialItems: ModerationQueueItem[];
  currentUserId: string;
  canDecideApplications: boolean;
};

export function ModerationQueue({
  initialItems,
  currentUserId,
  canDecideApplications,
}: Props) {
  const t = useTranslations("moderation");
  const [items, setItems] = React.useState(initialItems);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const targetLabel: Record<ModerationQueueItem["targetType"], string> = {
    church: t("labelChurch"),
    rating: t("labelRating"),
    application: t("labelApplication"),
  };

  async function act(
    item: ModerationQueueItem,
    action: "approve" | "reject"
  ) {
    const key = `${item.targetType}:${item.targetId}`;
    setBusyId(key);
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      let res: Response;
      if (item.targetType === "application" && canDecideApplications) {
        res = await fetch(`/api/applications/${item.targetId}/decide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: action }),
        });
      } else {
        res = await fetch(`/api/moderation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetType: item.targetType,
            targetId: item.targetId,
            action,
          }),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `http_${res.status}`);
      }
      setItems((list) =>
        list.filter(
          (i) =>
            !(i.targetType === item.targetType && i.targetId === item.targetId)
        )
      );
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [key]: err instanceof Error ? err.message : "unknown",
      }));
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-archival">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const key = `${item.targetType}:${item.targetId}`;
        const selfCreated = item.createdBy === currentUserId;
        const alreadySigned = item.signatures.some(
          (s) => s.actorId === currentUserId
        );
        const disabled = selfCreated || alreadySigned;
        return (
          <article
            key={key}
            className="rounded-lg bg-surface-container-lowest p-5 shadow-archival"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                  {targetLabel[item.targetType]} · {item.status.replaceAll("_", " ")}
                </p>
                <h3 className="mt-1 font-headline text-xl text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.subtitle}
                </p>
                {item.signatures.length > 0 && (
                  <p className="mt-2 text-xs text-outline">
                    {t("alreadySignedBy")}{" "}
                    {item.signatures
                      .map(
                        (s) =>
                          `${s.actorDisplayName ?? "anon"} (${s.action})`
                      )
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={disabled || busyId === key}
                  onClick={() => act(item, "approve")}
                  className="rounded bg-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary-dim disabled:opacity-50"
                >
                  {busyId === key ? t("working") : t("approve")}
                </button>
                <button
                  type="button"
                  disabled={disabled || busyId === key}
                  onClick={() => act(item, "reject")}
                  className="rounded border border-outline/60 bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface transition hover:border-error hover:text-error disabled:opacity-50"
                >
                  {t("reject")}
                </button>
              </div>
            </div>

            {selfCreated && (
              <p className="mt-3 text-xs text-outline">{t("ownEntry")}</p>
            )}
            {!selfCreated && alreadySigned && (
              <p className="mt-3 text-xs text-outline">
                {t("alreadySignedByYou")}
              </p>
            )}
            {errors[key] && (
              <p className="mt-3 text-xs text-error">
                {t("errorPrefix")} {errors[key]}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
