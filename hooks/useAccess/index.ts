"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { MyAccess, PlanFeature } from "@/@types";
import { currentLang, toLanguage } from "@/i18n";
import { getQueryClient } from "@/lib/query-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getMyAccess } from "@/request/billing";
import { useAuthStore } from "@/store/auth.store";

const STALE_MS = 60_000;

const accessQuery = (lang = currentLang()) => ({
  queryKey: QUERY_KEYS.access(lang),
  queryFn: () => getMyAccess(lang),
  staleTime: STALE_MS,
});

// Mening tarifim. Mehmonda so'rov ketmaydi (has() doim false).
// Login, to'lov (paid) va PREMIUM_REQUIRED dan keyin QUERY_KEYS.accessAll yangilanadi
export const useAccess = () => {
  const hasSession = useAuthStore((s) => s.hasSession);
  const lang = toLanguage(useTranslation().i18n.language);
  const query = useQuery({ ...accessQuery(lang), enabled: hasSession });
  const access = hasSession ? query.data : undefined;
  return {
    ...query,
    access,
    // Kirgan, lekin tarif hali yuklanmagan — qulf belgisini "miltillatmaslik" uchun
    isLoading: hasSession && query.isPending,
    isPremium: !!access?.isPremium,
    has: (feature: PlanFeature) => !!access?.features.includes(feature),
  };
};

// Komponentdan tashqarida (masalan, testni boshlashdan oldin): keshdagisi yoki serverdan
export const fetchAccess = (): Promise<MyAccess> => getQueryClient().fetchQuery(accessQuery());

export const refetchAccess = () => getQueryClient().invalidateQueries({ queryKey: QUERY_KEYS.accessAll });
