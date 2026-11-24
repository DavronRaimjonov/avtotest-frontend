"use client";

import { useTranslation } from "react-i18next";
import { LockIcon, PlayIcon, RetryIcon } from "@/components/ui/icons";
import { useReviewQuery } from "@/hooks/useQuery";
import { MAX_TEST_COUNT } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import { useStartAttempt } from "@/request/mutation";
import { usePaywallStore } from "@/store/paywall.store";
import { reviewWhen } from "./when";

// Bosqichlar ranglari: 0/3 — yangi xato (qizil), 1/3 — sariq, 2/3 — o'rganilishga yaqin (ko'k)
const STEP_TONES = ["bg-bad", "bg-warn", "bg-navy-2"];

// Aqlli takrorlash kartasi (GET /me/review): bugun nechta savol, o'rganilayotgan / o'rganilganlar, bosqichlar
// va "Takrorlashni boshlash" (source: "review"). Tarifda smart_review yo'q bo'lsa raqamlar ko'rinadi, tugma qulf → paywall.
// Hali xato bo'lmasa karta ko'rsatilmaydi
export const ReviewCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { data, isPending, isError } = useReviewQuery();
  const { start, isPending: starting, variables } = useStartAttempt();
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  if (isPending) return <span className={cn("h-52 animate-pulse rounded-3xl bg-soft", className)} />;
  if (isError || (data.learning === 0 && data.learned === 0)) return null;

  const due = data.dueNow > 0;
  const total = data.byStep.reduce((a, b) => a + b, 0);
  const loading = starting && variables?.source === "review";

  const onStart = () => {
    if (data.locked) openPaywall("smart_review");
    else start({ source: "review", mode: "practice", count: Math.min(data.dueNow, MAX_TEST_COUNT) });
  };

  return (
    <section className={cn("flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 flex-none items-center justify-center rounded-2xl bg-tint-blue text-navy-2">
          <RetryIcon size={20} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="m-0 text-xl font-extrabold">{t("review.title")}</h2>
          <span className="text-[13px] leading-snug text-muted">{t("review.hint")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <b className={cn("text-lg leading-snug", due ? "text-ink" : "text-slate")}>
          {due
            ? t("review.dueNow", { count: data.dueNow })
            : data.nextDueAt
              ? t("review.nothingToday", { date: reviewWhen(data.nextDueAt, t) })
              : t("review.empty")}
        </b>
        <span className="text-sm text-muted">
          {t("review.learning")} <b className="text-ink">{data.learning}</b> · {t("review.learned")}{" "}
          <b className="text-ok-text">{data.learned}</b>
          {data.dueNext24h > 0 && <> · {t("review.next24h", { count: data.dueNext24h })}</>}
        </span>
      </div>

      {/* Bosqichlar bo'yicha taqsimot */}
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <span className="flex h-2.5 overflow-hidden rounded-full bg-soft">
            {data.byStep.map((n, i) =>
              n > 0 ? <span key={i} className={STEP_TONES[i] ?? "bg-navy-2"} style={{ width: `${(n / total) * 100}%` }} /> : null,
            )}
          </span>
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {data.byStep.map((n, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", STEP_TONES[i] ?? "bg-navy-2")} />
                {t("review.step", { step: i, total: data.stepsToLearn })}: <b className="text-ink">{n}</b>
              </span>
            ))}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={(!due && !data.locked) || loading}
        className="btn-hover flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-extrabold text-navy disabled:cursor-not-allowed disabled:opacity-50 sm:self-start"
      >
        {data.locked ? <LockIcon size={16} strokeWidth={2.4} /> : <PlayIcon size={14} />}
        {loading ? t("common.starting") : t("review.start")}
      </button>
    </section>
  );
};
