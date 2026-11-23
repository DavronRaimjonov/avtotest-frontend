"use client";

import type { GuestLimits, StartAttemptBody } from "@/@types";
import { useMetaQuery } from "@/hooks/useQuery";
import { GUEST_FREE_VARIANTS, GUEST_MAX_TEST_SIZE, LOGIN_ONLY_SOURCES } from "@/lib/constants";
import { getQueryClient } from "@/lib/query-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Meta } from "@/@types";
import { useAuthStore } from "@/store/auth.store";

const DEFAULT_LIMITS: GuestLimits = { freeVariants: GUEST_FREE_VARIANTS, maxTestSize: GUEST_MAX_TEST_SIZE };

// Mehmon cheklovlari (FRONTEND-API.md 2.3): faqat 1–3-variant va 20 savolgacha tasodifiy test.
// Qolgani — mavzu, qiyin savollar, real imtihon, 50/100/200, 4-variantdan keyingilar — kirish bilan.
// requiresLogin — variant kartasidagi backend belgisi (GET /variants)
export const guestNeedsLogin = (body: StartAttemptBody, limits: GuestLimits, requiresLogin?: boolean) => {
  if (LOGIN_ONLY_SOURCES.includes(body.source)) return true;
  if (body.source === "variant") return !!requiresLogin;
  return (body.count ?? GUEST_MAX_TEST_SIZE) > limits.maxTestSize;
};

// Komponentdan tashqarida (testni boshlashda): /meta keshdagisi yoki standart qiymat
export const currentGuestLimits = () =>
  getQueryClient().getQueryData<Meta>(QUERY_KEYS.meta)?.guestLimits ?? DEFAULT_LIMITS;

// UI uchun: mehmonda qaysi tugmalarga 🔒 qo'yish (kirgan foydalanuvchida hech narsa qulflanmaydi)
export const useGuestLimits = () => {
  const hasSession = useAuthStore((s) => s.hasSession);
  const { data: meta } = useMetaQuery();
  const limits = meta?.guestLimits ?? DEFAULT_LIMITS;
  return {
    isGuest: !hasSession,
    limits,
    locked: (body: StartAttemptBody, requiresLogin?: boolean) =>
      !hasSession && guestNeedsLogin(body, limits, requiresLogin),
  };
};
