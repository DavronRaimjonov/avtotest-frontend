"use client";

import { useTranslation } from "react-i18next";
import type { GroupResult, GroupTestState } from "@/@types";
import { ResultReview } from "@/components/result/review";
import { ScoreRing } from "@/components/result/summary";
import { CheckIcon, ClockIcon, RetryIcon, XIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { cn, formatTime } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";
import { ConnectionBadge, GroupShell } from "../shell";

type Props = {
  state: GroupTestState;
  result: GroupResult;
  // Test hali davom etmoqda (men tugatganman) — socket ulanish holati
  connected?: boolean;
};

// Mening natijam. To'g'ri javoblar (tahlil) faqat butun test yakunlangach keladi (state.review)
export const GroupResultView = ({ state, result, connected = false }: Props) => {
  const { t } = useTranslation();
  const { start, isPending } = useStartAttempt();
  const finished = state.status === "finished";
  // wrongCount ga javobsizlar ham kiradi — haqiqiy xatolar alohida
  const mistakes = Math.max(0, result.wrongCount - result.unansweredCount);

  const stats = [
    { label: t("result.stats.correct"), value: result.correctCount, tone: "text-ok-text" },
    { label: t("result.stats.wrong"), value: mistakes, tone: "text-bad-text" },
    ...(result.unansweredCount
      ? [{ label: t("result.stats.unanswered"), value: result.unansweredCount, tone: "text-muted" }]
      : []),
    { label: t("result.stats.time"), value: formatTime(result.durationSec) },
  ];

  return (
    <GroupShell
      title={state.title}
      subtitle={t(finished ? "groupTest.result.subtitleFinished" : "groupTest.result.subtitle")}
      aside={finished ? undefined : <ConnectionBadge connected={connected} />}
    >
      <section className="flex animate-fade-in flex-wrap items-center gap-10 rounded-[28px] border border-line bg-white p-6 sm:p-9">
        <ScoreRing correct={result.correctCount} total={state.questionCount} percent={result.percent} passed={result.passed} />
        <div className="flex flex-[1_1_320px] flex-col gap-3.5">
          <span
            className={cn(
              "inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[13px] font-extrabold",
              result.passed ? "bg-ok-bg text-ok-text" : "bg-bad-bg text-bad-text",
            )}
          >
            {result.passed ? <CheckIcon size={16} /> : <XIcon size={16} />}
            {result.passed ? t("result.passed") : t("result.failed")}
          </span>
          {finished && state.finishReason && (
            <span className="text-sm font-bold text-muted">{t(`groupTest.reason.${state.finishReason}`)}</span>
          )}
          <h1 className="m-0 text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            {result.passed ? t("result.passedTitle") : t("result.failedTitle")}
          </h1>
          <p className="m-0 leading-relaxed text-muted">{t("groupTest.result.passPercent", { pass: state.passPercent })}</p>
          <div className="flex flex-wrap gap-3 pt-1.5">
            <Link
              href={ROUTES.groupTests}
              className="btn-hover flex h-13 items-center rounded-[14px] bg-accent px-6 font-extrabold text-navy no-underline"
            >
              {t("groupTest.mine.title")}
            </Link>
            {/* Xatolar "Xatolarim"ga test yakunlanganda yoziladi */}
            {finished && mistakes > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => start({ source: "mistakes", mode: "practice" })}
                className="flex h-13 items-center gap-2 rounded-[14px] border-[1.5px] border-line bg-white px-5.5 font-bold text-bad-text disabled:opacity-60"
              >
                <RetryIcon size={18} />
                {isPending ? t("common.starting") : t("result.mistakes")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-white px-5.5 py-5">
            <span className="text-[13px] font-bold text-muted">{s.label}</span>
            <b className={cn("text-[28px]", s.tone)}>{s.value}</b>
          </div>
        ))}
      </section>

      {finished && state.review ? (
        <ResultReview result={{ review: state.review }} />
      ) : (
        <div role="status" className="flex items-center gap-3.5 rounded-[20px] border border-line bg-white px-5 py-4.5">
          <span className="flex size-10 flex-none items-center justify-center rounded-[10px] bg-tint-blue text-navy-2">
            <ClockIcon size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <b className="text-[15px]">{t("groupTest.result.reviewLater")}</b>
            <span className="text-sm text-muted">{t("groupTest.result.reviewLaterText")}</span>
          </div>
        </div>
      )}
    </GroupShell>
  );
};
