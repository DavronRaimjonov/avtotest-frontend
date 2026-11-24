"use client";

import { useTranslation } from "react-i18next";
import { CrownIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useAccess } from "@/hooks/useAccess";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";

// Header: tarifi bor — kichik "PRO" belgisi, yo'q (yoki mehmon) — "Tarif olish" tugmasi. Ikkalasi narxlar sahifasiga
export const PlanBadge = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const { access, isLoading } = useAccess();
  if (isLoading) return null;

  const current = access?.current;
  return (
    <Link
      href={ROUTES.pricing}
      title={current ? (current.planTitle ?? current.planCode) : undefined}
      className={cn(
        "flex h-10 flex-none items-center gap-1.5 rounded-[10px] px-3 text-sm font-extrabold whitespace-nowrap no-underline transition-colors max-[860px]:hidden",
        current ? "bg-accent/15 text-accent hover:bg-accent/25" : "border border-accent/50 text-accent hover:bg-accent/10",
        !hasSession && "max-[1020px]:hidden",
      )}
    >
      <CrownIcon size={16} />
      {current ? current.planCode.toUpperCase() : t("account.getPlan")}
    </Link>
  );
};
