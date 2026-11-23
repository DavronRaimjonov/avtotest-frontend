"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LockIcon, XIcon } from "@/components/ui/icons";
import { usePlansQuery } from "@/hooks/useQuery";
import { useRouter } from "@/hooks/useRouter";
import { formatPrice } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { usePaywallStore } from "@/store/paywall.store";

// "Bu bo'lim tarif bilan ochiladi": PREMIUM_REQUIRED kelganda yoki qulflangan elementni bosganda.
// Matn feature'ga qarab, pastida eng arzon sotuvdagi tarif narxi ("45 000 so'mdan")
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
  // Eng arzon sotuvdagi tarif — faqat shu imkoniyatni ochadiganlari orasidan (videos faqat Max'da: u "Tez kunda"
  // bo'lsa narx ko'rsatilmaydi, aks holda Standart narxi chalg'itadi)
  const cheapest = plans?.items
    .filter((p) => !p.comingSoon && (!feature || p.features.includes(feature)))
    .sort((a, b) => a.priceUzs - b.priceUzs)[0];

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
        {cheapest && (
          <span className="rounded-full bg-bg px-3 py-1 text-[13px] font-bold text-navy-2">
            {t("paywall.from", { price: formatPrice(cheapest.priceUzs) })}
          </span>
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
