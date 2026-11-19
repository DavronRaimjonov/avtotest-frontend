"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/hooks/useRouter";
import type { AnswerBody, Attempt, GuestSource, StartAttemptBody } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import i18next, { currentLang } from "@/i18n";
import { FINISH_DELAY_MS, GUEST_ID, LAST_ATTEMPT_KEY, LOGIN_ONLY_SOURCES } from "@/lib/constants";
import { getErrorCode } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";
import { answerAttempt, finishAttempt, startAttempt } from "../attempt";
import { checkGuestAnswer, getGuestResult, startGuestTest } from "../guest";

const storage = {
  set: (id: string) => {
    try {
      localStorage.setItem(LAST_ATTEMPT_KEY, id);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(LAST_ATTEMPT_KEY);
    } catch {}
  },
};

// Testni boshlash. Kirgan — /attempts (saqlanadi), mehmon — /guest/tests (saqlanmaydi).
// Xatolar va saqlanganlar faqat kirganlarga: mehmonga Google oynasi ochiladi, kirgach test o'zi boshlanadi
export const useStartAttempt = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const server = useMutation({
    mutationKey: ["attempts", "start"],
    mutationFn: (body: StartAttemptBody) => startAttempt(body),
    onSuccess: (attempt) => {
      queryClient.setQueryData(QUERY_KEYS.attempt(attempt.id), attempt);
      storage.set(attempt.id);
      router.push(ROUTES.test(attempt.id));
    },
    // NO_QUESTIONS (masalan, xatolar ro'yxati bo'sh), NOT_FOUND
    onError: notifyApiError,
  });

  const guest = useMutation({
    mutationKey: ["guest", "start"],
    mutationFn: (body: StartAttemptBody) => startGuestTest(body),
    onSuccess: (test) => {
      useGuestStore.getState().begin(test);
      router.push(ROUTES.test(GUEST_ID));
    },
    onError: notifyApiError,
  });

  const start = (body: StartAttemptBody) => {
    // Test tili — joriy ilova tili (berilmagan bo'lsa)
    const withLang = { ...body, lang: body.lang ?? currentLang() };
    const { hasSession, openLogin } = useAuthStore.getState();
    if (hasSession) server.mutate(withLang);
    else if (LOGIN_ONLY_SOURCES.includes(body.source)) openLogin(() => server.mutate(withLang));
    else guest.mutate({ ...withLang, source: body.source as GuestSource });
  };

  return {
    start,
    isPending: server.isPending || guest.isPending,
    variables: server.variables ?? guest.variables,
  };
};

const patchAttempt = (attempt: Attempt, questionId: number, patch: Partial<Attempt["questions"][number]>) => {
  const questions = attempt.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q));
  return {
    ...attempt,
    questions,
    answeredCount: questions.filter((q) => q.myAnswerId !== null).length,
  };
};

// Tanlov darhol ko'rinadi (optimistik), backend javobi kelgach to'g'ri/xato bo'yaladi (ikkala rejimda).
// Imtihonda xatolar limitidan oshilsa (finished) natija bir oz ko'rsatilib, natija sahifasiga o'tiladi
export const useAnswerMutation = (attemptId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.attempt(attemptId);

  return useMutation({
    mutationKey: ["attempts", attemptId, "answer"],
    mutationFn: (body: AnswerBody) => answerAttempt(attemptId, body),
    onMutate: async ({ questionId, answerId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Attempt>(key);
      if (prev) queryClient.setQueryData(key, patchAttempt(prev, questionId, { myAnswerId: answerId }));
      return { prev };
    },
    onSuccess: (res, { questionId }) => {
      // Xato -> "Xatolarim" ga qo'shiladi, to'g'ri javob -> chiqadi (backend): ro'yxat eskirdi
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mistakeLists, refetchType: "none" });
      queryClient.setQueryData<Attempt>(key, (a) =>
        a && {
          ...patchAttempt(a, questionId, {
            isCorrect: res.isCorrect,
            correctAnswerId: res.correctAnswerId,
            explanation: res.explanation,
          }),
          correctCount: res.correctCount,
          wrongCount: res.wrongCount,
          mistakesLeft: res.mistakesLeft,
          finishReason: res.finishReason,
        },
      );
      if (res.finished) {
        notify(i18next.t("test.failedLimit", { count: res.wrongCount }), "info");
        storage.clear();
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.variants });
          router.replace(ROUTES.result(attemptId));
        }, FINISH_DELAY_MS);
      }
    },
    onError: (error, _body, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
      const code = getErrorCode(error);
      // Test yakunlangan / vaqt tugagan yoki boshqa qurilmada javob berilgan — holat serverdan qayta olinadi
      if (code === "ATTEMPT_FINISHED" || code === "ALREADY_ANSWERED") {
        queryClient.invalidateQueries({ queryKey: key, exact: true });
      }
      notifyApiError(error);
    },
  });
};

export const useFinishAttemptMutation = (attemptId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["attempts", attemptId, "finish"],
    mutationFn: () => finishAttempt(attemptId),
    onSuccess: (result) => {
      queryClient.setQueryData(QUERY_KEYS.attemptResult(attemptId), result);
      // Variantlar setkasidagi natija va xatolar ro'yxati yangilanadi
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.variants });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mistakeLists });
      storage.clear();
      router.replace(ROUTES.result(attemptId));
    },
    onError: notifyApiError,
  });
};

// ---------- Mehmon ----------
// Har bir javob (ikkala rejimda) serverda tekshiriladi. Tanlov darhol yoziladi, xato bo'lsa bekor qilinadi.
// onLimit — imtihonda xatolar maxMistakes dan oshdi (frontend o'zi aniqlaydi)
export const useGuestCheckMutation = (onLimit: () => void) =>
  useMutation({
    mutationKey: ["guest", "check"],
    mutationFn: (body: AnswerBody) => checkGuestAnswer({ ...body, lang: currentLang() }),
    onMutate: ({ questionId, answerId }) => useGuestStore.getState().pick(questionId, answerId),
    onSuccess: (check, { questionId }) => {
      const store = useGuestStore.getState();
      store.reveal(questionId, check);
      const { test, answers } = useGuestStore.getState();
      if (!test || test.mode !== "exam" || test.maxMistakes == null) return;
      const wrong = Object.values(answers).filter((a) => a.check?.isCorrect === false).length;
      if (wrong > test.maxMistakes) {
        notify(i18next.t("test.failedLimit", { count: wrong }), "info");
        setTimeout(onLimit, FINISH_DELAY_MS);
      }
    },
    onError: (error, { questionId }) => {
      useGuestStore.getState().unpick(questionId);
      notifyApiError(error);
    },
  });

// timeUp — vaqt tugagani uchun (natijada finishReason: time_up)
export const useGuestFinishMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["guest", "finish"],
    mutationFn: (timeUp: boolean = false) => {
      const { test, answers } = useGuestStore.getState();
      if (!test) throw new Error("no guest test");
      const spent = Math.round((Date.now() - test.startedAt) / 1000);
      return getGuestResult({
        questionIds: test.questions.map((q) => q.id),
        answers: Object.entries(answers).map(([questionId, a]) => ({
          questionId: Number(questionId),
          answerId: a.answerId,
        })),
        mode: test.mode,
        variantId: test.variant?.id,
        durationSec: test.timeLimitSec ? Math.min(spent, test.timeLimitSec) : spent,
        timeUp,
        lang: currentLang(),
      });
    },
    onSuccess: (result) => {
      useGuestStore.getState().complete(result);
      router.replace(ROUTES.result(GUEST_ID));
    },
    // UNKNOWN_QUESTIONS, QUESTION_NOT_IN_ATTEMPT
    onError: notifyApiError,
  });
};
