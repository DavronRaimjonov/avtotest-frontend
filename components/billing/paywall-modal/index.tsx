"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CrownIcon, LockIcon, XIcon } from "@/components/ui/icons";
import { usePlansQuery } from "@/hooks/useQuery";
import { useRouter } from "@/hooks/useRouter";
import { formatPrice } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { usePaywallStore } from "@/store/paywall.store";

// "Bu bo'lim tarif bilan ochiladi": PREMIUM_REQUIRED kelganda yoki qulflangan elementni bosganda.
// Matn feature'ga qarab, pastida shu imkoniyat qaysi tariflarda borligi (nomi va narxi, "Tez kunda" bo'lsa shunday)
export const PaywallModal = () => {
  const open = usePaywallStore((s) => s.open);
  if (!open) return null;
  return <PaywallDialog />;
};

const PaywallDialog = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const feature = usePaywallStore((s) => s.feature);
  const close = usePaywallStore((s) => s.closePaywall);
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { data: plans } = usePlansQuery();
  // Shu imkoniyatni ochadigan tariflar, arzonidan boshlab (masalan, aqlli takrorlash — Pro va Max)
  const included = (plans?.items ?? [])
    .filter((p) => !feature || p.features.includes(feature))
    .sort((a, b) => a.priceUzs - b.priceUzs);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const toPricing = () => {
    close();
    // Mehmonga avval kirish, keyin narxlar sahifasi
    if (hasSession) router.push(ROUTES.pricing);
    else openLogin(() => router.push(ROUTES.pricing));
  };

  const text = feature && feature !== "all_tests" ? t(`paywall.${feature}`) : t("paywall.text");

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-navy/60 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-100 flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center text-ink shadow-float"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t("common.close")}
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg"
        >
          <XIcon size={18} />
        </button>
        <span className="flex size-14 items-center justify-center rounded-2xl bg-tint-yellow text-tint-yellow-fg">
          <LockIcon size={26} />
        </span>
        <h2 id="paywall-title" className="m-0 text-[22px] font-extrabold tracking-tight">
          {t("paywall.title")}
        </h2>
        <p className="m-0 text-[15px] leading-relaxed text-slate">{text}</p>
        {included.length > 0 && (
          <div className="flex w-full flex-col gap-2 rounded-2xl bg-bg p-3 text-left">
            <span className="px-1 text-xs font-bold tracking-wide text-muted uppercase">{t("paywall.availableIn")}</span>
            {included.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5">
                <CrownIcon size={16} className="flex-none text-tint-yellow-fg" />
                <b className="flex-1 text-[15px]">{p.title}</b>
                {p.comingSoon ? (
                  <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold text-muted">{t("pricing.comingSoon")}</span>
                ) : (
                  <span className="text-sm font-extrabold text-navy-2">{formatPrice(p.priceUzs)}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex w-full flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={toPricing}
            className="btn-hover h-12 rounded-xl bg-accent font-extrabold text-navy"
          >
            {hasSession ? t("paywall.cta") : t("paywall.loginCta")}
          </button>
          <button type="button" onClick={close} className="h-11 rounded-xl text-sm font-bold text-muted hover:bg-bg">
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
