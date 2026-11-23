"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { PageParams, Paginated, VariantSize } from "@/@types";
import { currentLang, toLanguage } from "@/i18n";
import {
  GROUP_LOBBY_POLL_MS,
  PAYMENT_POLL_MAX_MS,
  PAYMENT_POLL_MS,
  SAVED_PAGE_SIZE,
} from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAttempt, getAttemptResult, getAttempts } from "@/request/attempt";
import { getOrder, getOrders, getPlans } from "@/request/billing";
import { getCheatSheet, getCheatSheets } from "@/request/cheat-sheets";
import { getGroupTest, getGroupTests } from "@/request/group-test";
import {
  getDemoQuestion,
  getMeta,
  getTopics,
  getVariants,
} from "@/request/landing";
import {
  getSign,
  getSignGroup,
  getSignGroups,
  searchSigns,
} from "@/request/signs";
import {
  getBookmarkIds,
  getBookmarks,
  getExplanations,
  getMe,
  getMistakes,
  getStats,
} from "@/request/user";
import { useAuthStore } from "@/store/auth.store";

const useHasSession = () => useAuthStore((s) => s.hasSession);

// Joriy ilova tili — kalitda bo'lsa til almashganda qayta so'raladi
const useCurrentLang = () => toLanguage(useTranslation().i18n.language);

// ---------- Katalog (tokensiz) ----------
export const useMetaQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.meta,
    queryFn: getMeta,
    staleTime: 10 * 60_000,
  });

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
  return useQuery({
    queryKey: QUERY_KEYS.signGroups(lang),
    queryFn: () => getSignGroups(lang),
    staleTime: Infinity,
  });
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
  return useQuery({
    queryKey: QUERY_KEYS.sign(slug, lang),
    queryFn: () => getSign(slug, lang),
    staleTime: Infinity,
  });
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

// ---------- Shpargalka ----------
// Admin kamdan-kam o'zgartiradi — sahifalar orasida qayta so'ralmaydi
export const useCheatSheetsQuery = () => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.cheatSheets(lang),
    queryFn: () => getCheatSheets(lang),
    staleTime: 10 * 60_000,
  });
};

export const useCheatSheetQuery = (slug: string) => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.cheatSheet(slug, lang),
    queryFn: () => getCheatSheet(slug, lang),
    staleTime: 10 * 60_000,
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

// Profildagi testlar tarixi: sahifa almashganda eski ro'yxat turib turadi
export const useAttemptsQuery = (params: PageParams) =>
  useQuery({
    queryKey: QUERY_KEYS.attempts(params),
    queryFn: () => getAttempts(params),
    enabled: useHasSession(),
    placeholderData: keepPreviousData,
  });

// ---------- Jamoaviy test ----------
export const useGroupTestsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.groupTests,
    queryFn: getGroupTests,
    enabled: useHasSession(),
  });

// Holat socket hodisalari (status, qayta ulanish) va vkladkaga qaytishda yangilanadi.
// Lobbyda qatnashchilar soni uchun vaqti-vaqti bilan ham so'raladi (socket uni yubormaydi)
export const useGroupTestQuery = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.groupTest(id),
    queryFn: () => getGroupTest(id, currentLang()),
    staleTime: Infinity,
    refetchInterval: (query) => (query.state.data?.status === "waiting" ? GROUP_LOBBY_POLL_MS : false),
  });

// ---------- Kabinet ----------
export const useMeQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: getMe,
    enabled: useHasSession(),
  });

export const useStatsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => getStats(),
    enabled: useHasSession(),
  });

// Test sahifasida "Saqlash" belgisi uchun bir marta olinadi
export const useBookmarkIdsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.bookmarkIds,
    queryFn: getBookmarkIds,
    enabled: useHasSession(),
    staleTime: Infinity,
    select: (ids) => new Set(ids),
  });

// "Yana yuklash": keyingi sahifa — yuklanganlari total'dan kam bo'lsa
const nextPage = <T>(last: Paginated<T>, all: Paginated<T>[]) =>
  all.reduce((n, p) => n + p.items.length, 0) < last.total
    ? last.page + 1
    : undefined;

// Saqlangan savollar (to'g'ri javobi va izohi bilan). Kalitda til: matnlar joriy tilda
export const useBookmarksQuery = () => {
  const lang = useCurrentLang();
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.bookmarkList(lang),
    queryFn: ({ pageParam }) =>
      getBookmarks({ page: pageParam, limit: SAVED_PAGE_SIZE, lang }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: useHasSession(),
  });
};

// Xatolarim: savol istalgan testda to'g'ri yechilsa ro'yxatdan o'zi chiqadi (backend)
export const useMistakesQuery = () => {
  const lang = useCurrentLang();
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.mistakeList(lang),
    queryFn: ({ pageParam }) =>
      getMistakes({ page: pageParam, limit: SAVED_PAGE_SIZE, lang }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: useHasSession(),
  });
};

// Mehmon natijasidagi izohlar: faqat kirgan foydalanuvchiga (kirgach o'zi so'raladi)
export const useExplanationsQuery = (questionIds: number[], enabled = true) => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.explanations(questionIds, lang),
    queryFn: () => getExplanations(questionIds, lang),
    enabled: useHasSession() && enabled && questionIds.length > 0,
    staleTime: Infinity,
    select: (rows) => new Map(rows.map((r) => [r.id, r.explanation])),
  });
};

// ---------- Tariflar va to'lov ----------
export const usePlansQuery = () => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.plans(lang),
    queryFn: () => getPlans(lang),
    staleTime: 5 * 60_000,
  });
};

// To'lovdan qaytgach: pending bo'lsa har 2.5 soniyada, startedAt dan ~60 soniyagacha qayta so'raladi.
// "To'landi" faqat status === "paid" bo'lganda (sahifaga qaytishning o'zi to'lov emas)
export const useOrderQuery = (id: number, startedAt: number) => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: () => getOrder(id, lang),
    enabled: useHasSession() && Number.isInteger(id) && id > 0,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" && Date.now() - startedAt < PAYMENT_POLL_MAX_MS
        ? PAYMENT_POLL_MS
        : false,
  });
};

export const useOrdersQuery = (page = 1) => {
  const lang = useCurrentLang();
  return useQuery({
    queryKey: QUERY_KEYS.orders(page),
    queryFn: () => getOrders({ page, limit: 20, lang }),
    enabled: useHasSession(),
    placeholderData: keepPreviousData,
  });
};
