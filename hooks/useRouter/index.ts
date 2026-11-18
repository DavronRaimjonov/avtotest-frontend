"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toLanguage } from "@/i18n";
import { localePath } from "@/lib/routes";

// next/navigation useRouter + joriy til prefiksi: push("/test/x") → /ru/test/x.
// Barqaror obyekt (effect bog'liqliklarida ishlatsa bo'ladi)
export const useRouter = () => {
  const router = useNextRouter();
  const lang = toLanguage(useTranslation().i18n.language);
  return useMemo(
    () => ({
      ...router,
      push: (href: string) => router.push(localePath(lang, href)),
      replace: (href: string) => router.replace(localePath(lang, href)),
    }),
    [router, lang],
  );
};
