"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/hooks/useRouter";
import { isAxiosError } from "axios";
import type { AnswerBody, ApiError, Attempt, AttemptSource, GuestSource, PlanFeature, StartAttemptBody } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import i18next, { currentLang } from "@/i18n";
import { FINISH_DELAY_MS, GUEST_ID, LAST_ATTEMPT_KEY } from "@/lib/constants";
import { getErrorCode } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ROUTES } from "@/lib/routes";
import { fetchAccess } from "@/hooks/useAccess";
import { currentGuestLimits, guestNeedsLogin } from "@/hooks/useGuestLimits";
import { useAuthStore } from "@/store/auth.store";
import { useGuestStore } from "@/store/guest.store";
import { usePaywallStore } from "@/store/paywall.store";
import { answerAttempt, finishAttempt, startAttempt } from "../attempt";
import { checkGuestAnswer, getGuestResult, startGuestTest } from "../guest";

// Tarif bilan ochiladigan test manbalari: boshlashdan oldin imkoniyat tekshiriladi (yo'q bo'lsa paywall)
const PAID_SOURCES: Partial<Record<AttemptSource, PlanFeature>> = {
  exam: "final_exam",
  review: "smart_review",
};

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
// Mehmon faqat 1–3-variant va 20 savolgacha tasodifiy test ishlaydi (hooks/useGuestLimits): qolganida kirish
// oynasi ochiladi, kirgach test o'zi boshlanadi. Server baribir 401 LOGIN_REQUIRED qaytarsa ham shunday.
// Yakuniy test (exam) va aqlli takrorlash (review) — faqat tarif bilan: mehmonga avval kirish, tarifsizga paywall.
// Kesh eskirgan bo'lsa server 403 PREMIUM_REQUIRED qaytaradi — paywall request/index.ts da ochiladi
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
    // Cheklovdan oshdi (masalan, keshdagi requiresLogin eskirgan): sababi aytiladi va kirish oynasi ochiladi
    onError: (error, body) => {
      if (isAxiosError<ApiError>(error) && error.response?.data?.code === "LOGIN_REQUIRED") {
        const reason = error.response.data.params?.reason;
        notify(i18next.t(`guestLimits.${reason ?? "source"}`, { defaultValue: i18next.t("guestLimits.source") }), "info");
        useAuthStore.getState().openLogin(() => start(body));
        return;
      }
      notifyApiError(error);
    },
  });

  // requiresLogin — variant kartasidagi backend belgisi (mehmonda 4-variantdan boshlab true)
  const start = (body: StartAttemptBody, opts: { requiresLogin?: boolean } = {}) => {
    // Test tili — joriy ilova tili (berilmagan bo'lsa)
    const withLang = { ...body, lang: body.lang ?? currentLang() };
    const { hasSession, openLogin } = useAuthStore.getState();
    const feature = PAID_SOURCES[body.source];
    if (feature) {
      const startPaid = async () => {
        const access = await fetchAccess().catch(() => null);
        if (access && !access.features.includes(feature)) {
          usePaywallStore.getState().openPaywall(feature);
          return;
        }
        server.mutate(withLang);
      };
      if (hasSession) startPaid();
      else openLogin(startPaid);
      return;
    }
    if (hasSession) server.mutate(withLang);
    else if (guestNeedsLogin(body, currentGuestLimits(), opts.requiresLogin)) openLogin(() => server.mutate(withLang));
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
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.readinessAll });
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
      // Takrorlash bosqichlari va tayyorlik foizi o'zgardi
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.readinessAll });
      // Profildagi testlar tarixi
      queryClient.invalidateQueries({ queryKey: ["attempts", "list"] });
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
