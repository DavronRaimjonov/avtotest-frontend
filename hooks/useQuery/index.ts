"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { PageParams, VariantSize } from "@/@types";
import { currentLang, toLanguage } from "@/i18n";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAttempt, getAttemptResult, getAttempts } from "@/request/attempt";
import { getDemoQuestion, getMeta, getTopics, getVariants } from "@/request/landing";
import { getSign, getSignGroup, getSignGroups, searchSigns } from "@/request/signs";
import { getBookmarkIds, getMe, getStats } from "@/request/user";
import { useAuthStore } from "@/store/auth.store";

const useHasSession = () => useAuthStore((s) => s.hasSession);

// Joriy ilova tili — kalitda bo'lsa til almashganda qayta so'raladi
const useCurrentLang = () => toLanguage(useTranslation().i18n.language);

// ---------- Katalog (tokensiz) ----------
export const useMetaQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.meta, queryFn: getMeta, staleTime: 10 * 60_000 });

export const useDemoQuestionQuery = () => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.demoQuestion(lang),
    queryFn: () => getDemoQuestion(lang),
    staleTime: Infinity,
  });
};

export const useVariantsQuery = (size: VariantSize) => {
  const hasSession = useHasSession();
  return useQuery({
    queryKey: QUERY_KEYS.variantList(size, hasSession),
    queryFn: () => getVariants(size),
    placeholderData: keepPreviousData,
  });
};

export const useTopicsQuery = () => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.topics(lang),
    queryFn: () => getTopics(lang),
    staleTime: 10 * 60_000,
  });
};

// ---------- Yo'l belgilari ----------
export const useSignGroupsQuery = () => {
  const lang = useCurrentLang();
  return useQuery({ queryKey: QUERY_KEYS.signGroups(lang), queryFn: () => getSignGroups(lang), staleTime: Infinity });
};

export const useSignGroupQuery = (slug: string) => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.signGroup(slug, lang),
    queryFn: () => getSignGroup(slug, lang),
    staleTime: Infinity,
  });
};

export const useSignQuery = (slug: string) => {
  const lang = useCurrentLang();
  return useQuery({ queryKey: QUERY_KEYS.sign(slug, lang), queryFn: () => getSign(slug, lang), staleTime: Infinity });
};

// Bo'sh qidiruvda so'rov ketmaydi
export const useSignSearchQuery = (search: string) => {
  const lang = useCurrentLang();
  const q = search.trim();
  return useQuery({
    queryKey: QUERY_KEYS.signSearch(q, lang),
    queryFn: () => searchSigns(q, lang),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
};

// ---------- Test ----------
// Test holati keshda turadi: javoblar optimistik yoziladi (request/mutation/attempt.ts).
// Matnlar joriy tilda; til almashganda useLang ["attempts"] ni yangilaydi. enabled — mehmon testida so'rov ketmaydi
export const useAttemptQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.attempt(id),
    queryFn: () => getAttempt(id, currentLang()),
    enabled,
    staleTime: Infinity,
  });

// Yakunlashda finish javobi keshga yoziladi — natija sahifasi qayta so'ramaydi
export const useAttemptResultQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.attemptResult(id),
    queryFn: () => getAttemptResult(id, currentLang()),
    enabled,
    staleTime: Infinity,
  });

export const useAttemptsQuery = (params: PageParams) =>
  useQuery({
    queryKey: QUERY_KEYS.attempts(params),
    queryFn: () => getAttempts(params),
    enabled: useHasSession(),
  });

// ---------- Kabinet ----------
export const useMeQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.me, queryFn: getMe, enabled: useHasSession() });

export const useStatsQuery = () =>
  useQuery({ queryKey: QUERY_KEYS.stats, queryFn: () => getStats(), enabled: useHasSession() });

// Test sahifasida "Saqlash" belgisi uchun bir marta olinadi
export const useBookmarkIdsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.bookmarkIds,
    queryFn: getBookmarkIds,
    enabled: useHasSession(),
    staleTime: Infinity,
    select: (ids) => new Set(ids),
  });
