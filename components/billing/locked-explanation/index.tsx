"use client";

import { useTranslation } from "react-i18next";
import { LockIcon } from "@/components/ui/icons";
import { useRouter } from "@/hooks/useRouter";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";

// Izoh o'rnidagi xira blok: tarifsiz — "Tarif oling" (narxlar sahifasiga),
// mehmon — "Kiring va tarif oling" (avval kirish oynasi, keyin narxlar sahifasi)
export const LockedExplanation = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const toPricing = () => router.push(ROUTES.pricing);

  return (
    <button
      type="button"
      onClick={() => (hasSession ? toPricing() : openLogin(toPricing))}
      className={cn(
        "flex w-fit max-w-full items-center gap-2 rounded-[10px] border border-dashed border-line bg-bg px-3 py-2 text-left text-[13px] font-semibold text-slate hover:border-navy-2/40",
        className,
      )}
    >
      <LockIcon size={16} className="flex-none text-navy-2" />
      <span>
        {t(hasSession ? "paywall.lockedExplanation" : "paywall.lockedExplanationGuest")}{" "}
        <b className="text-navy-2">{t("paywall.cta")}</b>
      </span>
    </button>
  );
};
