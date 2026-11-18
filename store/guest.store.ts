import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Attempt, GuestCheckResponse, GuestResult, GuestTest } from "@/@types";
import { GUEST_ID, GUEST_STORAGE_KEY } from "@/lib/constants";

// Mehmon testi: server hech narsa saqlamaydi, shuning uchun savollar, javoblar va taymer shu yerda.
// sessionStorage — sahifa yangilansa ham test yo'qolmaydi, vkladka yopilsa tozalanadi
export interface GuestAnswer {
  answerId: number;
  // Mashqda /guest/check javobi
  check?: GuestCheckResponse;
}

export type ActiveGuestTest = GuestTest & {
  startedAt: number;
  // Date.now() ms, mashqda null
  deadline: number | null;
};

interface GuestState {
  test: ActiveGuestTest | null;
  answers: Record<number, GuestAnswer>;
  result: GuestResult | null;
  begin: (test: GuestTest) => void;
  pick: (questionId: number, answerId: number) => void;
  unpick: (questionId: number) => void;
  reveal: (questionId: number, check: GuestCheckResponse) => void;
  complete: (result: GuestResult) => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      test: null,
      answers: {},
      result: null,
      begin: (test) => {
        const now = Date.now();
        set({
          test: { ...test, startedAt: now, deadline: test.timeLimitSec ? now + test.timeLimitSec * 1000 : null },
          answers: {},
          result: null,
        });
      },
      pick: (questionId, answerId) => set((s) => ({ answers: { ...s.answers, [questionId]: { answerId } } })),
      unpick: (questionId) =>
        set((s) => {
          const answers = { ...s.answers };
          delete answers[questionId];
          return { answers };
        }),
      reveal: (questionId, check) =>
        set((s) => {
          const a = s.answers[questionId];
          return a ? { answers: { ...s.answers, [questionId]: { ...a, check } } } : s;
        }),
      // Natija qoladi (natija sahifasi uchun), test tozalanadi
      complete: (result) => set({ result, test: null, answers: {} }),
    }),
    {
      name: GUEST_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      // Serverda sessionStorage yo'q: mount'dan keyin o'qiladi, shunda hydration mos keladi
      skipHydration: true,
    },
  ),
);

// sessionStorage'dan o'qib bo'lingach true (serverda va birinchi renderda false)
export const useGuestHydrated = () => {
  useEffect(() => {
    if (!useGuestStore.persist.hasHydrated()) useGuestStore.persist.rehydrate();
  }, []);
  return useSyncExternalStore(
    (onChange) => useGuestStore.persist.onFinishHydration(onChange),
    () => useGuestStore.persist.hasHydrated(),
    () => false,
  );
};

// Mehmon testini kirgan foydalanuvchi testi shakliga keltiradi — test ekrani ikkalasi uchun bitta
export const guestToAttempt = (test: ActiveGuestTest, answers: Record<number, GuestAnswer>): Attempt => {
  const practice = test.mode === "practice";
  const questions = test.questions.map((q) => {
    const a = answers[q.id];
    return {
      ...q,
      myAnswerId: a?.answerId ?? null,
      isCorrect: a?.check?.isCorrect ?? null,
      ...(a?.check && { correctAnswerId: a.check.correctAnswerId, explanation: a.check.explanation }),
    };
  });
  // Javob natijasi ikkala rejimda darhol keladi — hisoblar ham ikkalasida
  const correct = questions.filter((q) => q.isCorrect === true).length;
  const wrong = questions.filter((q) => q.isCorrect === false).length;
  return {
    id: GUEST_ID,
    source: test.source,
    mode: test.mode,
    status: "in_progress",
    variant: test.variant,
    topicId: test.topicId,
    questionCount: test.questionCount,
    timeLimitSec: test.timeLimitSec,
    correctCount: correct,
    wrongCount: wrong,
    percent: null,
    passed: null,
    passPercent: test.passPercent,
    maxMistakes: test.maxMistakes ?? null,
    finishReason: null,
    durationSec: null,
    startedAt: new Date(test.startedAt).toISOString(),
    finishedAt: null,
    lang: test.lang,
    remainingSec: null,
    mistakesLeft: practice || test.maxMistakes == null ? null : Math.max(0, test.maxMistakes - wrong),
    deadline: test.deadline,
    answeredCount: questions.filter((q) => q.myAnswerId !== null).length,
    questions,
  };
};
