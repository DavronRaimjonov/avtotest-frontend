"use client";

import { useTranslation } from "react-i18next";
import type { Readiness, ReadinessLevel, ReadinessTip, StartAttemptBody } from "@/@types";
import { InfoIcon } from "@/components/ui/icons";
import { useReadinessQuery } from "@/hooks/useQuery";
import { cn } from "@/lib/helpers";
import { useStartAttempt } from "@/request/mutation";

// Daraja ranglari: qizil · sariq · ko'k · yashil
const LEVEL_TONE: Record<ReadinessLevel, { text: string; stroke: string }> = {
  low: { text: "text-bad-text", stroke: "stroke-bad" },
  medium: { text: "text-warn-text", stroke: "stroke-warn" },
  good: { text: "text-navy-2", stroke: "stroke-navy-2" },
  ready: { text: "text-ok-text", stroke: "stroke-ok" },
};

// Maslahat tugmasi qaysi testni boshlaydi (keep_going — tugmasiz).
// exam va review tarifsizga paywall ochadi (useStartAttempt)
const tipTest = (tip: ReadinessTip): StartAttemptBody | null => {
  switch (tip.code) {
    case "take_exam":
      return { source: "exam", mode: "exam" };
    case "review_due":
      return { source: "review", mode: "practice", count: tip.params.count };
    case "weak_topic":
      return { source: "topic", mode: "practice", topicId: tip.params.topicId };
    case "low_coverage":
      return { source: "random", mode: "practice" };
    default:
      return null;
  }
};

// GET /me/readiness: tayyorlik foizi (aylana), daraja, 7 kunlik o'zgarish, 3 qism, maslahatlar, zaif mavzular, grafik.
// "O'tish ehtimoli" emas — tayyorlik ko'rsatkichi
export const ReadinessCard = () => {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useReadinessQuery();
  const { start, isPending: starting } = useStartAttempt();

  if (isPending) return <span className="h-72 animate-pulse rounded-3xl bg-soft" />;
  if (isError)
    return (
      <section className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-white p-6">
        <p className="m-0 text-muted">{t("readiness.loadError")}</p>
        <button type="button" onClick={() => refetch()} className="h-10 rounded-xl bg-navy px-4 text-sm font-bold text-white">
          {t("common.retry")}
        </button>
      </section>
    );

  const tone = LEVEL_TONE[data.level];
  const tips = data.tips.slice(0, 2);
  const parts = [
    { key: "exam", score: data.components.exam.score },
    { key: "accuracy", score: data.components.accuracy.score },
    { key: "coverage", score: data.components.coverage.score },
  ] as const;

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="m-0 text-xl font-extrabold">{t("readiness.title")}</h2>

      <div className="flex items-center gap-5">
        <Ring score={data.score} stroke={tone.stroke} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <b className={cn("text-lg leading-snug", tone.text)}>{t(`readiness.level.${data.level}`)}</b>
          {data.change7d !== null && data.change7d !== 0 && (
            <span
              className={cn(
                "w-fit rounded-full px-2.5 py-0.5 text-xs font-extrabold",
                data.change7d > 0 ? "bg-ok-bg text-ok-text" : "bg-bad-bg text-bad-text",
              )}
            >
              {data.change7d > 0 ? `▲ +${data.change7d}` : `▼ ${data.change7d}`} · {t("readiness.change")}
            </span>
          )}
          {!data.enoughData && <span className="text-xs text-muted">{t("readiness.estimate")}</span>}
        </div>
      </div>

      {/* Uch qism: imtihonlar · aniqlik · qamrov */}
      <div className="grid grid-cols-3 gap-2.5">
        {parts.map((p) => (
          <div key={p.key} className="flex flex-col gap-1.5 rounded-2xl bg-bg p-3">
            <span className="truncate text-xs text-muted">{t(`readiness.${p.key}`)}</span>
            <b className="text-lg leading-none font-extrabold">{p.score}%</b>
            <span className="block h-1.5 overflow-hidden rounded-full bg-soft">
              <span className="block h-full rounded-full bg-navy-2" style={{ width: `${p.score}%` }} />
            </span>
          </div>
        ))}
      </div>

      {tips.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {tips.map((tip) => {
            const body = tipTest(tip);
            return (
              <li key={tip.code} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line px-4 py-3">
                <InfoIcon size={18} className="flex-none text-navy-2" />
                <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                  {t(`readiness.tip.${tip.code}`, "params" in tip ? tip.params : {})}
                </span>
                {body && (
                  <button
                    type="button"
                    disabled={starting}
                    onClick={() => start(body)}
                    className="h-9 rounded-xl border-[1.5px] border-navy px-3.5 text-sm font-bold text-navy hover:bg-bg disabled:opacity-60"
                  >
                    {t(`readiness.action.${tip.code}`)}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {data.weakTopics.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <b className="text-sm">{t("readiness.weakTopics")}</b>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {data.weakTopics.map((x) => (
              <li key={x.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{x.name}</span>
                <b className={x.correctRate < 70 ? "text-bad-text" : "text-warn-text"}>{x.correctRate}%</b>
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => start({ source: "topic", mode: "practice", topicId: x.id })}
                  className="h-8 rounded-lg px-2.5 text-[13px] font-bold text-navy-2 hover:bg-bg disabled:opacity-60"
                >
                  {t("readiness.practice")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <History history={data.history} />
    </section>
  );
};

// Aylana progress: foiz markazda
const Ring = ({ score, stroke }: { score: number; stroke: string }) => {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex size-26 flex-none items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-soft" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, score)) / 100)}
          className={cn("transition-[stroke-dashoffset] duration-700", stroke)}
        />
      </svg>
      <b className="text-[26px] font-extrabold tracking-tight">{score}%</b>
    </span>
  );
};

// Oxirgi 30 kun: faqat sahifa ochilgan kunlar nuqta bo'ladi (2 tadan kam bo'lsa grafik ko'rsatilmaydi)
const History = ({ history }: { history: Readiness["history"] }) => {
  const { t } = useTranslation();
  if (history.length < 2) return null;

  const w = 300;
  const h = 64;
  const day = (d: string) => new Date(d).getTime();
  const first = day(history[0].day);
  const span = Math.max(1, day(history.at(-1)!.day) - first);
  const points = history.map((p) => [((day(p.day) - first) / span) * w, h - (p.score / 100) * h] as const);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted">{t("readiness.history")}</span>
      <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} className="h-18 w-full" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={`0,${h} ${line} ${w},${h}`} className="fill-tint-blue stroke-none" />
        <polyline points={line} fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="stroke-navy-2" />
      </svg>
    </div>
  );
};
