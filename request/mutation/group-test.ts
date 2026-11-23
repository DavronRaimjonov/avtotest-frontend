"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AnswerBody, GroupQuestion, GroupTestState } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import { useRouter } from "@/hooks/useRouter";
import i18next, { currentLang } from "@/i18n";
import { getErrorCode } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ROUTES } from "@/lib/routes";
import { answerGroupTest, finishGroupTest, joinGroupTest, leaveGroupTest } from "../group-test";

// Holat serverda o'zgargan (test boshlandi / yakunlandi, boshqa qurilmada javob berilgan) — qayta olinadi
const STALE_CODES = new Set(["ALREADY_ANSWERED", "ATTEMPT_FINISHED", "GROUP_TEST_INVALID_STATE"]);

// Kod bilan qo'shilish → lobby. Xatolar (INVALID_GROUP_CODE, GROUP_TEST_NOT_INVITED, GROUP_TEST_KICKED,
// TOO_MANY_REQUESTS) forma ostida ko'rsatiladi
export const useJoinGroupTestMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-tests", "join"],
    mutationFn: (code: string) => joinGroupTest(code),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupTests });
      router.push(ROUTES.groupTest(id));
    },
  });
};

type Feedback = Pick<GroupQuestion, "isCorrect" | "correctAnswerId">;

const patchQuestion = (
  state: GroupTestState,
  questionId: number,
  answerId: number,
  feedback?: Feedback,
): GroupTestState => {
  const questions = state.questions?.map((q) => (q.id === questionId ? { ...q, myAnswerId: answerId, ...feedback } : q));
  return {
    ...state,
    questions,
    answeredCount: questions?.filter((q) => q.myAnswerId !== null).length ?? state.answeredCount,
  };
};

// Tanlov darhol qotadi (optimistik). To'g'ri/xatoligi faqat instantFeedback testda javob bilan keladi
export const useGroupAnswerMutation = (id: string) => {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.groupTest(id);
  return useMutation({
    mutationKey: ["group-tests", id, "answer"],
    mutationFn: (body: AnswerBody) => answerGroupTest(id, body),
    onMutate: async ({ questionId, answerId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<GroupTestState>(key);
      if (prev) queryClient.setQueryData(key, patchQuestion(prev, questionId, answerId));
      return { prev };
    },
    // Shu orada holat qayta olingan bo'lsa ham (socket) tanlov yo'qolmasin
    onSuccess: (res, { questionId, answerId }) => {
      queryClient.setQueryData<GroupTestState>(
        key,
        (s) =>
          s && {
            ...patchQuestion(
              s,
              questionId,
              answerId,
              res.isCorrect !== undefined ? { isCorrect: res.isCorrect, correctAnswerId: res.correctAnswerId } : undefined,
            ),
            answeredCount: res.answeredCount,
          },
      );
    },
    onError: (error, _body, ctx) => {
      const code = getErrorCode(error);
      if (code && STALE_CODES.has(code)) {
        queryClient.invalidateQueries({ queryKey: key, exact: true });
      } else if (ctx?.prev) {
        queryClient.setQueryData(key, ctx.prev);
      }
      notifyApiError(error);
    },
  });
};

// Javobi GET /:id bilan bir xil — keshga yoziladi, sahifa o'zi natija ko'rinishiga o'tadi
export const useGroupFinishMutation = (id: string) => {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.groupTest(id);
  return useMutation({
    mutationKey: ["group-tests", id, "finish"],
    mutationFn: () => finishGroupTest(id, currentLang()),
    onSuccess: (state) => {
      queryClient.setQueryData(key, state);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupTests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
    onError: (error) => {
      const code = getErrorCode(error);
      if (code && STALE_CODES.has(code)) queryClient.invalidateQueries({ queryKey: key, exact: true });
      notifyApiError(error);
    },
  });
};

// Lobbydan chiqish. Test shu orada boshlangan bo'lsa (GROUP_TEST_INVALID_STATE) holat yangilanadi
export const useLeaveGroupTestMutation = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["group-tests", id, "leave"],
    mutationFn: () => leaveGroupTest(id),
    onSuccess: () => {
      notify(i18next.t("groupTest.left"), "info");
      queryClient.removeQueries({ queryKey: QUERY_KEYS.groupTest(id), exact: true });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupTests });
      router.replace(ROUTES.groupTests);
    },
    onError: (error) => {
      if (getErrorCode(error) === "GROUP_TEST_INVALID_STATE") {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupTest(id), exact: true });
      }
      notifyApiError(error);
    },
  });
};
