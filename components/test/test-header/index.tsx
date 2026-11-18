"use client";

import { Link } from "@/components/ui/link";
import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { Attempt } from "@/@types";
import { ChevronLeftIcon, ClockIcon } from "@/components/ui/icons";
import { TEST_LANGS, TIMER_WARN_SEC } from "@/lib/constants";
import { cn, formatTime, percent } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";

type Props = {
  attempt: Attempt;
  guest?: boolean;
  current: number;
  // Mashq rejimida null — vaqt cheklanmagan
  secondsLeft: number | null;
  finishing: boolean;
  onGo: (index: number) => void;
  onFinish: () => void;
};

// "Variant 4" yoki manba nomi (Xatolar ustida ishlash, ...). Mehmon natijasida source bo'lmaydi
// t hook'dan beriladi: serverda har so'rovning o'z i18n instance'i bor
export const attemptTitle = (t: TFunction, a: { variant: Attempt["variant"]; source?: Attempt["source"] }) =>
  a.variant ? t("source.variant", { number: a.variant.number }) : t(`source.${a.source ?? "random"}`);

// Savol tugmasi rangi (FRONTEND-API.md: navigatsiya ranglari)
const navTone = (myAnswerId: number | null, isCorrect: boolean | null) => {
  if (isCorrect === true) return "bg-ok-bg border-ok-line text-ok-text";
  if (isCorrect === false) return "bg-bad-bg border-bad-line text-bad-text";
  if (myAnswerId !== null) return "bg-tint-blue border-[#B9C8F2] text-navy-2";
  return "bg-white border-line text-slate";
};

export const TestHeader = ({ attempt, guest, current, secondsLeft, finishing, onGo, onFinish }: Props) => {
  const { t } = useTranslation();
  const langLabel = TEST_LANGS.find((l) => l.value === attempt.lang)?.label;
  const unanswered = attempt.questionCount - attempt.answeredCount;

  // Tasodifan bosib yuborilmasin: javobsiz savol bo'lsa ikkinchi bosishda yakunlanadi
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  const onFinishClick = () => {
    if (unanswered > 0 && !confirming) setConfirming(true);
    else onFinish();
  };

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex min-h-[68px] max-w-[1240px] flex-wrap items-center gap-4 px-4 sm:px-6">
        <Link
          href={ROUTES.variants}
          aria-label={t("common.back")}
          className="flex size-11 items-center justify-center rounded-[10px] border border-line text-navy sm:size-10"
        >
          <ChevronLeftIcon size={18} />
        </Link>
        <div className="flex flex-col">
          <b>{attemptTitle(t, attempt)}</b>
          <span className="text-[13px] text-muted">
            {t(`mode.${attempt.mode}.title`)} · {langLabel}
          </span>
          {guest && <span className="text-xs font-semibold text-warn-text">{t("test.guest")}</span>}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          {secondsLeft !== null && (
            <span
              role="timer"
              aria-label={t("test.timeLeft")}
              className={cn(
                "flex h-10 items-center gap-2 rounded-[10px] px-3.5 text-base font-extrabold tabular-nums",
                secondsLeft < TIMER_WARN_SEC ? "bg-bad-bg text-bad-text" : "bg-bg text-ink",
              )}
            >
              <ClockIcon size={18} strokeWidth={2.2} />
              {formatTime(secondsLeft)}
            </span>
          )}
          <button
            type="button"
            onClick={onFinishClick}
            disabled={finishing}
            className={cn(
              "flex h-10 items-center rounded-[10px] px-[18px] text-sm font-bold text-white disabled:opacity-60",
              confirming ? "bg-bad" : "bg-navy",
            )}
          >
            {finishing ? t("test.finishing") : confirming ? t("test.confirmFinish", { count: unanswered }) : t("test.finish")}
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 pb-3.5 sm:px-6">
        <span className="block h-1 overflow-hidden rounded-full bg-soft">
          <span
            className="block h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${percent(attempt.answeredCount, attempt.questionCount)}%` }}
          />
        </span>
        <nav aria-label={t("test.questions")} className="flex gap-1.5 overflow-x-auto pb-0.5">
          {attempt.questions.map((q, i) => {
            const isCurrent = i === current;
            return (
              <button
                key={q.id}
                type="button"
                aria-label={t("test.questionNav", { n: q.number })}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onGo(i)}
                className={cn(
                  "h-10 w-11 flex-none rounded-[10px] border-[1.5px] text-sm font-bold",
                  isCurrent ? "border-navy bg-navy text-white" : navTone(q.myAnswerId, q.isCorrect),
                )}
              >
                {q.number}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
