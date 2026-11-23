"use client";

import { useTranslation } from "react-i18next";
import { CrownIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useAccess } from "@/hooks/useAccess";
import { PLAN_EXPIRY_WARN_DAYS } from "@/lib/constants";
import { cn, daysLeft, formatDate } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";

// Mening tarifim: faol bo'lsa nomi, muddati, qolgan kunlar va navbatdagi davrlar; yo'q bo'lsa "Tariflarni ko'rish"
export const PlanCard = () => {
  const { t } = useTranslation();
  const { access, isLoading } = useAccess();

  if (isLoading) return <span className="h-44 animate-pulse rounded-3xl bg-soft" />;

  const current = access?.current;
  const left = current ? daysLeft(current.expiresAt) : null;
  const expiring = left !== null && left <= PLAN_EXPIRY_WARN_DAYS;

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-3xl p-6",
        current ? "bg-navy text-white" : "border border-line bg-white",
      )}
    >
      <div className="flex items-center gap-2">
        <CrownIcon size={18} className={current ? "text-accent" : "text-tint-yellow-fg"} />
        <span className={cn("text-[13px] font-bold tracking-wide uppercase", current ? "text-pale" : "text-muted")}>
          {t("account.myPlan")}
        </span>
      </div>

      {current ? (
        <>
          <div className="flex flex-col gap-1">
            <b className="text-[28px] leading-tight font-extrabold text-accent">{current.planTitle ?? current.planCode}</b>
            <span className="text-sm text-pale">
              {t("account.until", { date: formatDate(current.expiresAt) })} · {t("profile.daysLeft", { count: left ?? 0 })}
            </span>
            {access?.upcoming.map((u) => (
              <span key={u.id} className="text-sm text-pale">
                {t("account.next", { plan: u.planTitle ?? u.planCode, date: formatDate(u.expiresAt) })}
              </span>
            ))}
          </div>
          {expiring && (
            <span className="rounded-xl bg-warn-bg px-3 py-2 text-[13px] font-semibold text-warn-text">
              {t("pricing.expiresSoon", { count: left })}
            </span>
          )}
          <Link
            href={ROUTES.pricing}
            className="flex h-11 items-center justify-center rounded-xl border border-white/20 text-sm font-bold text-white no-underline hover:bg-white/10"
          >
            {expiring ? t("profile.extend") : t("paywall.cta")}
          </Link>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <b className="text-lg font-extrabold">{t("account.noPlan")}</b>
            <span className="text-sm leading-relaxed text-muted">{t("profile.noPlanText")}</span>
          </div>
          <Link
            href={ROUTES.pricing}
            className="btn-hover flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-extrabold text-navy no-underline"
          >
            {t("paywall.cta")}
          </Link>
        </>
      )}
    </section>
  );
};
