"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReportBody } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import i18next from "@/i18n";
import { QUERY_KEYS } from "@/lib/query-keys";
import { addBookmark, reportQuestion, removeBookmark } from "../user";

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
