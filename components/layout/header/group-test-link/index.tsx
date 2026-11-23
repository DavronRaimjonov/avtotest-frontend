"use client";

import { useTranslation } from "react-i18next";
import { UsersIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";

// "Jamoaviy testga qo'shilish" — kirganlarga, keng ekranda (torroq ekranda akkaunt menyusida, mobilda "Ko'proq"da)
export const GroupTestLink = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  if (!hasSession) return null;

  return (
    <Link
      href={ROUTES.groupTests}
      className="flex h-10 items-center gap-2 rounded-[10px] border border-white/15 px-3.5 text-sm font-bold text-white no-underline transition-colors hover:bg-white/10 max-[1180px]:hidden"
    >
      <UsersIcon size={18} className="text-accent" />
      {t("groupTest.join.cta")}
    </Link>
  );
};
