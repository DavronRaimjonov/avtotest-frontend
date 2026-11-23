"use client";

import { Link } from "@/components/ui/link";
import { useTranslation } from "react-i18next";
import type { ResultData } from "@/@types";
import {
  ArrowRightIcon,
  CheckIcon,
  RetryIcon,
  XIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";

const R = 84;
const CIRC = 2 * Math.PI * R;

export const ResultSummary = ({ result }: { result: ResultData }) => {
  const { t } = useTranslation();
  const {
    passed,
    correctCount,
    questionCount,
    percent,
    wrongCount,
    passPercent,
    variant,
    mode,
  } = result;
  const { start, isPending, variables } = useStartAttempt();

  return (
    <section className="flex flex-wrap items-center gap-10 rounded-[28px] border border-line bg-white p-6 sm:p-9">
      <ScoreRing
        correct={correctCount}
        total={questionCount}
        percent={percent}
        passed={passed}
      />

      <div className="flex flex-[1_1_360px] flex-col gap-3.5">
        <span
          className={cn(
            "inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[13px] font-extrabold",
            passed ? "bg-ok-bg text-ok-text" : "bg-bad-bg text-bad-text",
          )}
        >
          {passed ? <CheckIcon size={16} /> : <XIcon size={16} />}
          {passed ? t("result.passed") : t("result.failed")}
        </span>
        {result.finishReason && result.finishReason !== "completed" && (
          <span className="text-sm font-bold text-bad-text">
            {t(`result.reason.${result.finishReason}`, {
              count: result.maxMistakes ?? 0,
            })}
          </span>
        )}
        <h1 className="m-0 text-[36px] font-extrabold tracking-tight">
          {passed ? t("result.passedTitle") : t("result.failedTitle")}
        </h1>
        <p className="m-0 leading-relaxed text-muted">
          {passed
            ? wrongCount
              ? t("result.passedTextMistakes", { count: wrongCount })
              : t("result.passedText")
            : t("result.failedText", { pass: passPercent, count: wrongCount })}
        </p>
        <div className="flex flex-wrap gap-3 pt-1.5">
          <Link
            href={ROUTES.variants}
            className="btn-hover flex h-13 items-center gap-2 rounded-[14px] bg-accent px-6 font-extrabold text-navy no-underline"
          >
            {t("result.next")}
            <ArrowRightIcon size={18} />
          </Link>
          {variant && (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                start({ source: "variant", variantId: variant.id, mode })
              }
              className="flex h-13 items-center gap-2 rounded-[14px] border-[1.5px] border-navy bg-white px-5.5 font-bold text-navy disabled:opacity-60"
            >
              {isPending && variables?.source === "variant"
                ? t("common.starting")
                : t("result.retry")}
            </button>
          )}
          {wrongCount > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => start({ source: "mistakes", mode: "practice" })}
              className="flex h-13 items-center gap-2 rounded-[14px] border-[1.5px] border-line bg-white px-5.5 font-bold text-bad-text disabled:opacity-60"
            >
              <RetryIcon size={18} />
              {isPending && variables?.source === "mistakes"
                ? t("common.starting")
                : t("result.mistakes")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

// Natija halqasi: o'rtada "18/20" va foiz (jamoaviy test natijasi ham ishlatadi)
export const ScoreRing = ({
  correct,
  total,
  percent,
  passed,
}: {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
}) => {
  const { t } = useTranslation();
  const color = passed ? "#22A55A" : "#DC2626";
  return (
    <div className="relative size-50 flex-none">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        role="img"
        aria-label={t("result.ring", { total, correct })}
      >
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="#EEF1F7"
          strokeWidth="18"
        />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${(percent / 100) * CIRC} ${CIRC}`}
          transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl leading-none font-extrabold tracking-[-0.03em]">
          {correct}
          <span className="text-2xl text-subtle">/{total}</span>
        </span>
        <span
          className={cn(
            "mt-1.5 text-sm font-bold",
            passed ? "text-ok-text" : "text-bad-text",
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
};
