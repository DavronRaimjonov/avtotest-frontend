"use client";

import { Link } from "@/components/ui/link";
import { useParams } from "next/navigation";
import { useRouter } from "@/hooks/useRouter";
import { useEffect, useEffectEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AnswerBody, Attempt } from "@/@types";
import { useCountdown } from "@/hooks/useCountdown";
import { useAttemptQuery, useBookmarkIdsQuery } from "@/hooks/useQuery";
import { GUEST_ID } from "@/lib/constants";
import { getErrorCode, getErrorMessage } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import {
  useAnswerMutation,
  useFinishAttemptMutation,
  useGuestCheckMutation,
  useGuestFinishMutation,
  useToggleBookmarkMutation,
} from "@/request/mutation";
import { useAuthStore } from "@/store/auth.store";
import { useExamStore } from "@/store/exam.store";
import { guestToAttempt, useGuestHydrated, useGuestStore } from "@/store/guest.store";
import { QuestionView } from "./question-view";
import { TestFooter } from "./test-footer";
import { TestHeader } from "./test-header";

// /test/guest — mehmon testi (holat brauzerda), /test/<uuid> — kirgan foydalanuvchi testi (serverda)
export const TestRunner = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  return attemptId === GUEST_ID ? <GuestTestRunner /> : <ServerTestRunner id={attemptId} />;
};

const ServerTestRunner = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: attempt, isPending, isError, error, refetch } = useAttemptQuery(id);
  const answer = useAnswerMutation(id);
  const finish = useFinishAttemptMutation(id);
  const finished = attempt?.status === "finished";

  // Yakunlangan (yoki vaqti tugab server yakunlagan) test — natija sahifasiga
  useEffect(() => {
    if (finished) router.replace(ROUTES.result(id));
  }, [finished, id, router]);

  // Vkladkaga qaytilganda qolgan vaqt va holat serverdan yangilanadi
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && refetch();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  // Jamoaviy test urinishi bu yerda ochilmaydi — jamoaviy test sahifasiga
  if (isError && getErrorCode(error) === "GROUP_ATTEMPT") {
    return (
      <TestMessage title={t("test.openError")} text={getErrorMessage(error)}>
        <Link
          href={ROUTES.groupTests}
          className="flex h-12 items-center rounded-xl bg-navy px-6 font-bold text-white no-underline"
        >
          {t("groupTest.title")}
        </Link>
      </TestMessage>
    );
  }

  if (isError) {
    return (
      <TestMessage title={t("test.openError")} text={getErrorMessage(error)}>
        <button type="button" onClick={() => refetch()} className="h-12 rounded-xl bg-navy px-6 font-bold text-white">
          {t("common.retry")}
        </button>
      </TestMessage>
    );
  }

  if (isPending || finished) return <TestSkeleton />;

  return (
    <ActiveTest
      key={attempt.id}
      attempt={attempt}
      onAnswer={answer.mutate}
      onFinish={() => !finish.isPending && finish.mutate()}
      finishing={finish.isPending}
    />
  );
};

const GuestTestRunner = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const hydrated = useGuestHydrated();
  const test = useGuestStore((s) => s.test);
  const answers = useGuestStore((s) => s.answers);
  const hasResult = useGuestStore((s) => !!s.result);
  const finish = useGuestFinishMutation();
  // Imtihonda xatolar limitidan oshildi — darhol yakunlanadi
  const check = useGuestCheckMutation(() => finish.mutate(false));
  const attempt = useMemo(() => (test ? guestToAttempt(test, answers) : null), [test, answers]);

  // Test yakunlangan, lekin natijaga o'tilmagan bo'lsa (masalan, orqaga qaytilgan)
  useEffect(() => {
    if (hydrated && !test && hasResult) router.replace(ROUTES.result(GUEST_ID));
  }, [hydrated, test, hasResult, router]);

  if (!hydrated || (!test && hasResult)) return <TestSkeleton />;
  if (!attempt) return <TestMessage title={t("test.notFound")} text={t("test.notFoundText")} />;

  return (
    <ActiveTest
      key={test!.startedAt}
      attempt={attempt}
      guest
      onAnswer={check.mutate}
      onFinish={(timeUp) => !finish.isPending && !finish.isSuccess && finish.mutate(!!timeUp)}
      finishing={finish.isPending}
    />
  );
};

type ActiveProps = {
  attempt: Attempt;
  guest?: boolean;
  onAnswer: (body: AnswerBody) => void;
  // timeUp — taymer tugadi (mehmonda natijaga yuboriladi; kirganda server o'zi aniqlaydi)
  onFinish: (timeUp?: boolean) => void;
  finishing: boolean;
  // Jamoaviy test: sarlavha (test nomi), orqaga havola, to'g'ri/xato ko'rsatilmaydi (blind)
  // va ochilgan savol haqida xabar (admin jonli ko'radi)
  title?: string;
  backHref?: string;
  blind?: boolean;
  onView?: (questionId: number) => void;
};

export const ActiveTest = ({
  attempt,
  guest,
  onAnswer,
  onFinish,
  finishing,
  title,
  backHref,
  blind,
  onView,
}: ActiveProps) => {
  const { t } = useTranslation();
  const current = useExamStore((s) => s.current);
  const setCurrent = useExamStore((s) => s.goTo);
  const bookmark = useToggleBookmarkMutation();
  const { data: bookmarks } = useBookmarkIdsQuery();
  const secondsLeft = useCountdown(attempt.deadline);

  const total = attempt.questions.length;
  const goTo = (i: number) => setCurrent(i, total);
  const question = attempt.questions[Math.min(current, total - 1)];

  // Davom ettirilgan testda birinchi javobsiz savoldan boshlanadi
  const openFirst = useEffectEvent(() => {
    const i = attempt.questions.findIndex((q) => q.myAnswerId === null);
    setCurrent(i === -1 ? 0 : i, total);
  });
  useEffect(() => openFirst(), []);

  // Javobdan keyin avtomatik o'tilmaydi: keyingi savolga faqat "Keyingi" tugmasi, Enter yoki → bilan
  const pick = (answerId: number) => {
    // Javob ikkala rejimda qotadi: natija darhol ko'rsatiladi, o'zgartirib bo'lmaydi
    if (question.myAnswerId !== null || finishing) return;
    onAnswer({ questionId: question.id, answerId });
  };

  // Ochilgan savol tashqariga xabar qilinadi (jamoaviy testda socket orqali adminga)
  const notifyView = useEffectEvent((questionId: number) => onView?.(questionId));
  const questionId = question?.id;
  useEffect(() => {
    if (questionId !== undefined) notifyView(questionId);
  }, [questionId]);

  // Vaqt tugasa test frontend tomonidan yakunlanadi (kirgan foydalanuvchida server ham o'zi tekshiradi)
  const onTimeOver = useEffectEvent(() => onFinish(true));
  useEffect(() => {
    if (secondsLeft === 0) onTimeOver();
  }, [secondsLeft]);

  // Imtihon markazidagi kabi F1–F9 bilan javob tanlash (Mac'da F-tugmalar Fn talab qilishi mumkin —
  // shuning uchun 1–9 raqamlari ham ishlaydi), Enter — keyingi savol, ← → bilan savollar orasida yurish
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const m = /^F([1-9])$/.exec(e.key) ?? /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
    if (m) {
      // Brauzerning F1 (yordam), F5 (yangilash) kabi amallari ishlamasin
      e.preventDefault();
      const opt = question.answers.find((a) => a.position === Number(m[1]));
      if (opt) pick(opt.id);
    } else if (e.key === "Enter") {
      // Ochiq oyna (masalan, "Yakunlash" tasdig'i) o'z Enter'ini ishlatadi
      if (target?.closest("[role='dialog']")) return;
      // Fokusdagi tugma (masalan, hozir bosilgan javob) qayta bosilmasin
      e.preventDefault();
      if (current < total - 1) goTo(current + 1);
    } else if (e.key === "ArrowRight") goTo(current + 1);
    else if (e.key === "ArrowLeft") goTo(current - 1);
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const saved = !!bookmarks?.has(question.id);
  // "Saqlash" va "Xato haqida xabar" faqat kirganlarga — mehmonga Google oynasi
  const requireLogin = (action: () => void) => () => {
    const { hasSession, openLogin } = useAuthStore.getState();
    if (hasSession) action();
    else openLogin(action);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <TestHeader
        attempt={attempt}
        guest={guest}
        title={title}
        backHref={backHref}
        current={current}
        secondsLeft={secondsLeft}
        finishing={finishing}
        onGo={goTo}
        onFinish={() => onFinish(false)}
      />
      <QuestionView
        key={question.id}
        question={question}
        index={current}
        total={total}
        saved={saved}
        onPick={pick}
        onBookmark={requireLogin(() => bookmark.mutate({ questionId: question.id, saved }))}
        requireLogin={requireLogin}
      />
      <TestFooter
        okCount={attempt.correctCount ?? 0}
        badCount={attempt.wrongCount ?? 0}
        mistakesLeft={attempt.mistakesLeft}
        status={
          blind ? t("groupTest.answered", { count: attempt.answeredCount, total: attempt.questionCount }) : undefined
        }
        isFirst={current === 0}
        isLast={current === total - 1}
        onPrev={() => goTo(current - 1)}
        onNext={() => goTo(current + 1)}
      />
    </div>
  );
};

const TestMessage = ({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <b className="text-xl">{title}</b>
      <span className="max-w-md text-muted">{text}</span>
      <div className="flex gap-3">
        {children}
        <Link
          href={ROUTES.variants}
          className="flex h-12 items-center rounded-xl border-[1.5px] border-navy px-6 font-bold text-navy no-underline"
        >
          {t("common.variants")}
        </Link>
      </div>
    </div>
  );
};

export const TestSkeleton = () => (
  <div className="flex min-h-dvh flex-col">
    <div className="h-35 border-b border-line bg-white" />
    <div className="mx-auto flex w-full max-w-310 flex-wrap gap-7 px-6 pt-7">
      <div className="flex flex-[999_1_520px] flex-col gap-3.5">
        <span className="h-5 w-32 animate-pulse rounded bg-soft" />
        <span className="h-16 animate-pulse rounded-xl bg-soft" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-15 animate-pulse rounded-2xl bg-soft" />
        ))}
      </div>
      <div className="aspect-4/3 flex-[1_1_380px] animate-pulse rounded-[20px] bg-soft" />
    </div>
  </div>
);
