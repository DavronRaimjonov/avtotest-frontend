"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Plan } from "@/@types";
import { CheckIcon, ShieldCheckIcon, XIcon } from "@/components/ui/icons";
import { useAccess } from "@/hooks/useAccess";
import { usePlansQuery } from "@/hooks/useQuery";
import { PLAN_EXPIRY_WARN_DAYS, PLAN_FEATURES, PLAN_QUERY_PARAM } from "@/lib/constants";
import { cn, daysLeft, formatDate, formatPrice } from "@/lib/helpers";
import { useAuthStore } from "@/store/auth.store";
import { PaymentMethodModal } from "./payment-method";

// /pricing — tariflar GET /plans dan (narx va muddatni admin o'zgartiradi). "Tanlash": mehmonga avval kirish,
// keyin to'lov usuli oynasi → POST /orders → Click / Payme sahifasi. ?plan=<id> — oyna darhol ochiladi
export const Pricing = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { data, isPending, isError, refetch } = usePlansQuery();
  const { access } = useAccess();
  // undefined — hali tanlanmagan: ?plan=2 bilan kelinganda (kirgan bo'lsa) to'lov oynasi darhol ochiladi.
  // null — foydalanuvchi oynani yopdi
  const [chosenId, setSelectedId] = useState<number | null>();
  const planParam = Number(searchParams.get(PLAN_QUERY_PARAM)) || null;
  const selectedId = chosenId === undefined ? (hasSession ? planParam : null) : chosenId;

  const choose = (plan: Plan) => {
    if (hasSession) setSelectedId(plan.id);
    else openLogin(() => setSelectedId(plan.id));
  };

  const selected = data?.items.find((p) => p.id === selectedId && !p.comingSoon);
  const current = access?.current;
  const left = current ? daysLeft(current.expiresAt) : null;

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 lg:pt-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="m-0 text-[32px] font-extrabold tracking-tight min-[861px]:text-[40px]">{t("pricing.title")}</h1>
        <p className="m-0 max-w-140 text-[15px] leading-relaxed text-muted">{t("pricing.subtitle")}</p>
      </div>

      {current && (
        <div
          className={cn(
            "mx-auto flex w-full max-w-260 flex-col gap-1 rounded-[20px] border px-5 py-4",
            left !== null && left <= PLAN_EXPIRY_WARN_DAYS ? "border-warn bg-warn-bg" : "border-ok-line bg-ok-bg",
          )}
        >
          <b className="text-ink">
            {t("pricing.activeBanner", { plan: current.planTitle ?? current.planCode, date: formatDate(current.expiresAt) })}
          </b>
          <span className="text-sm text-slate">
            {left !== null && left <= PLAN_EXPIRY_WARN_DAYS
              ? t("pricing.expiresSoon", { count: left })
              : t("pricing.activeHint")}
          </span>
          {/* Navbatdagi davrlar (tarif tugamasdan yana sotib olingan) */}
          {access?.upcoming.map((u) => (
            <span key={u.id} className="text-sm font-semibold text-slate">
              {t("account.next", { plan: u.planTitle ?? u.planCode, date: formatDate(u.expiresAt) })}
            </span>
          ))}
        </div>
      )}

      {isPending ? (
        <div className="mx-auto grid w-full max-w-260 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-105 animate-pulse rounded-[20px] bg-soft" />
          ))}
        </div>
      ) : isError ? (
        <div className="mx-auto flex flex-col items-center gap-3 py-10 text-center">
          <p className="m-0 text-muted">{t("pricing.loadError")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-hover h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-260 items-stretch gap-4 md:grid-cols-3">
          {data.items.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              active={current?.planCode === plan.code}
              canBuy={data.providers.length > 0}
              onChoose={() => choose(plan)}
            />
          ))}
        </div>
      )}

      <p className="m-0 flex items-start justify-center gap-2 text-center text-sm text-muted">
        <ShieldCheckIcon size={18} className="mt-px flex-none text-navy-2" />
        {data && data.providers.length === 0 ? t("pricing.paymentsOff") : t("pricing.footer")}
      </p>

      {selected && data && (
        <PaymentMethodModal
          plan={selected}
          providers={data.providers}
          activeUntil={current ? (access?.accessUntil ?? current.expiresAt) : null}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

type CardProps = { plan: Plan; active: boolean; canBuy: boolean; onChoose: () => void };

// Skrinshotdagi karta: POPULAR, nomi, tavsifi, narx, ✓/✗ imkoniyatlar, "Tanlash" (comingSoon — "Tez kunda")
const PlanCard = ({ plan, active, canBuy, onChoose }: CardProps) => {
  const { t } = useTranslation();
  const features = PLAN_FEATURES.filter((f) => !f.optional || plan.features.includes(f.key));

  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-[20px] border bg-white p-6",
        plan.isPopular ? "border-navy-2/40 shadow-card" : "border-line",
        plan.comingSoon && "opacity-75",
      )}
    >
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {plan.isPopular && (
          <span className="rounded-full bg-navy-2 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">
            {t("pricing.popular")}
          </span>
        )}
        {active && (
          <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-ok-text">
            {t("pricing.current")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-xl font-extrabold">{plan.title}</h2>
        {plan.description && <span className="text-sm text-muted">{plan.description}</span>}
      </div>
      <b className="text-[32px] leading-none font-extrabold tracking-tight">{formatPrice(plan.priceUzs)}</b>
      <ul className="m-0 flex flex-1 list-none flex-col gap-2.5 p-0 text-sm">
        <FeatureRow ok text={t("pricing.days", { count: plan.durationDays })} />
        {features.map((f) => (
          <FeatureRow key={f.key} ok={plan.features.includes(f.key)} text={t(`pricing.feature.${f.key}`)} />
        ))}
      </ul>
      <button
        type="button"
        onClick={onChoose}
        disabled={plan.comingSoon || !canBuy}
        className={cn(
          "h-12 rounded-xl text-[15px] font-extrabold transition-colors disabled:cursor-not-allowed",
          plan.isPopular && !plan.comingSoon
            ? "btn-hover bg-navy-2 text-white"
            : "border border-line bg-white text-ink hover:border-navy-2 disabled:hover:border-line",
          // To'lov tizimlari ulanmagan (providers bo'sh) — tugma o'chiqligi ko'rinsin
          !canBuy && !plan.comingSoon && "opacity-50",
        )}
      >
        {plan.comingSoon ? t("pricing.comingSoon") : t("pricing.choose")}
      </button>
    </article>
  );
};

const FeatureRow = ({ ok, text }: { ok: boolean; text: string }) => (
  <li className={cn("flex items-center gap-2.5", ok ? "text-slate" : "text-subtle")}>
    <span
      className={cn(
        "flex size-5 flex-none items-center justify-center rounded-full",
        ok ? "bg-ok-bg text-ok-text" : "bg-bad-bg text-bad",
      )}
    >
      {ok ? <CheckIcon size={12} strokeWidth={3} /> : <XIcon size={12} strokeWidth={3} />}
    </span>
    {text}
  </li>
);
