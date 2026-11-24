"use client";

import { type InfiniteData, type QueryClient, type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Paginated, ReportBody, UpdateMeBody } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import i18next from "@/i18n";
import { QUERY_KEYS } from "@/lib/query-keys";
import { addBookmark, deleteMistake, reportQuestion, removeBookmark, updateMe } from "../user";

// "Saqlash" — belgi darhol almashadi, xato bo'lsa qaytariladi
export const useToggleBookmarkMutation = () => {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.bookmarkIds;
  return useMutation({
    mutationKey: ["me", "bookmarks", "toggle"],
    mutationFn: ({ questionId, saved }: { questionId: number; saved: boolean }) =>
      saved ? removeBookmark(questionId) : addBookmark(questionId),
    onMutate: async ({ questionId, saved }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<number[]>(key);
      queryClient.setQueryData<number[]>(key, (ids = []) =>
        saved ? ids.filter((id) => id !== questionId) : [...ids, questionId],
      );
      return { prev };
    },
    onSuccess: (_d, { saved }) => notify(i18next.t(saved ? "notify.bookmarkRemoved" : "notify.bookmarkAdded"), "info"),
    onError: (error, _v, ctx) => {
      queryClient.setQueryData(key, ctx?.prev);
      notifyApiError(error);
    },
    // /saved ro'yxati keyingi ochilishda yangisini oladi
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarkLists }),
  });
};

type Pages = InfiniteData<Paginated<{ id: number }>>;
type Snapshot = [QueryKey, unknown][];

// Ro'yxatdan (barcha tillardagi keshdan) savolni olib tashlaydi va total'ni kamaytiradi
const dropFromLists = async (queryClient: QueryClient, prefix: QueryKey, questionId: number): Promise<Snapshot> => {
  await queryClient.cancelQueries({ queryKey: prefix });
  const snapshot = queryClient.getQueriesData({ queryKey: prefix });
  queryClient.setQueriesData<Pages>({ queryKey: prefix }, (data) => {
    if (!data?.pages) return data;
    const had = data.pages.some((p) => p.items.some((i) => i.id === questionId));
    if (!had) return data;
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.filter((i) => i.id !== questionId),
        total: Math.max(0, p.total - 1),
      })),
    };
  });
  return snapshot;
};

const restore = (queryClient: QueryClient, snapshot?: Snapshot) =>
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));

// /saved: karta darhol yo'qoladi; test ekranidagi "Saqlash" belgisi ham o'chadi. Xato bo'lsa qaytariladi
export const useRemoveBookmarkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "bookmarks", "remove"],
    mutationFn: (questionId: number) => removeBookmark(questionId),
    onMutate: async (questionId) => {
      const lists = await dropFromLists(queryClient, QUERY_KEYS.bookmarkLists, questionId);
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bookmarkIds });
      const ids = queryClient.getQueryData<number[]>(QUERY_KEYS.bookmarkIds);
      if (ids) queryClient.setQueryData<number[]>(QUERY_KEYS.bookmarkIds, ids.filter((id) => id !== questionId));
      return { lists, ids };
    },
    onSuccess: () => notify(i18next.t("notify.bookmarkRemoved"), "info"),
    onError: (error, _id, ctx) => {
      restore(queryClient, ctx?.lists);
      if (ctx?.ids) queryClient.setQueryData(QUERY_KEYS.bookmarkIds, ctx.ids);
      notifyApiError(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
  });
};

// /mistakes: karta darhol yo'qoladi, xato bo'lsa qaytariladi
export const useRemoveMistakeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "mistakes", "remove"],
    mutationFn: (questionId: number) => deleteMistake(questionId),
    onMutate: async (questionId) => ({
      lists: await dropFromLists(queryClient, QUERY_KEYS.mistakeLists, questionId),
    }),
    onSuccess: () => notify(i18next.t("notify.mistakeRemoved"), "info"),
    onError: (error, _id, ctx) => {
      restore(queryClient, ctx?.lists);
      notifyApiError(error);
    },
    // Takrorlash kartasidagi raqamlar ham o'zgaradi
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review });
    },
  });
};

export const useReportMutation = () =>
  useMutation({
    mutationKey: ["questions", "report"],
    mutationFn: ({ questionId, body }: { questionId: number; body: ReportBody }) =>
      reportQuestion(questionId, body),
    onSuccess: () => notify(i18next.t("notify.reportSent")),
    // VALIDATION_ERROR, TOO_MANY_REQUESTS
    onError: notifyApiError,
  });

// Profil: ism va familiyani saqlash. Javobdagi foydalanuvchi keshga yoziladi (header, menyu darhol yangilanadi)
export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["me", "update"],
    mutationFn: (body: UpdateMeBody) => updateMe(body),
    onSuccess: (me) => {
      queryClient.setQueryData(QUERY_KEYS.me, me);
      notify(i18next.t("profile.saved"));
    },
    onError: notifyApiError,
  });
};
