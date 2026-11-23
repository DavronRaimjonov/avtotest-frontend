"use client";

import { useTranslation } from "react-i18next";
import type { ResultData } from "@/@types";
import { cn, formatTime } from "@/lib/helpers";

export const ResultStats = ({ result }: { result: ResultData }) => {
  const { t } = useTranslation();
  // Mehmon natijasida vaqt null bo'lishi mumkin
  // wrongCount ga javobsizlar ham kiradi (3-xatoda to'xtagan imtihonda katta bo'ladi) — haqiqiy xatolar alohida
  const mistakes = result.review.filter(
    (r) => r.myAnswerId !== null && !r.isCorrect,
  ).length;
  const stats = [
    {
      label: t("result.stats.correct"),
      value: result.correctCount,
      tone: "text-ok-text",
    },
    { label: t("result.stats.wrong"), value: mistakes, tone: "text-bad-text" },
    ...(result.unansweredCount
      ? [
          {
            label: t("result.stats.unanswered"),
            value: result.unansweredCount,
            tone: "text-muted",
          },
        ]
      : []),
    {
      label: t("result.stats.time"),
      value: result.durationSec == null ? "—" : formatTime(result.durationSec),
    },
    {
      label: t("result.stats.avg"),
      value:
        result.avgSecPerQuestion == null
          ? "—"
          : t("result.stats.sec", { sec: result.avgSecPerQuestion }),
    },
  ];

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-white px-[22px] py-5"
        >
          <span className="text-[13px] font-bold text-muted">{s.label}</span>
          <b className={cn("text-[28px]", s.tone)}>{s.value}</b>
        </div>
      ))}
    </section>
  );
};
