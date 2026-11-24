"use client";

import { useTranslation } from "react-i18next";
import { BookmarkIcon, ChevronRightIcon, RetryIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useStatsQuery } from "@/hooks/useQuery";
import { cn, percent } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";

// 10450 → { h: 2, m: 54 }
const splitTime = (sec: number) => ({ h: Math.floor(sec / 3600), m: Math.floor((sec % 3600) / 60) });

// GET /me/stats: umumiy ko'rsatkichlar, bazaning qancha qismi ko'rilgan, xatolar/saqlanganlar.
// Zaif mavzular — tayyorlik blokida ("Mashq qilish" tugmasi bilan)
export const ProfileStats = () => {
  const { t } = useTranslation();
  const { data: stats, isPending, isError, refetch } = useStatsQuery();

  if (isPending) return <span className="h-80 animate-pulse rounded-3xl bg-soft" />;
  if (isError)
    return (
      <section className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-white p-6">
        <p className="m-0 text-muted">{t("profile.statsError")}</p>
        <button type="button" onClick={() => refetch()} className="h-10 rounded-xl bg-navy px-4 text-sm font-bold text-white">
          {t("common.retry")}
        </button>
      </section>
    );

  const time = splitTime(stats.totalTimeSec);
  const seen = percent(stats.uniqueQuestionsSeen, stats.totalQuestions);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="m-0 text-xl font-extrabold">{t("profile.statsTitle")}</h2>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Tile value={stats.finishedTests} label={t("profile.finishedTests")} />
        <Tile value={`${stats.examsPassed} / ${stats.exams}`} label={t("profile.examsPassed")} />
        <Tile value={`${stats.avgPercent}%`} label={t("profile.avgPercent")} />
        <Tile value={`${stats.correctRate}%`} label={t("profile.correctRate")} tone={stats.correctRate >= 90 ? "ok" : undefined} />
        <Tile value={stats.variantsSolved} label={t("profile.variantsSolved")} />
        <Tile value={t("profile.time", time)} label={t("profile.totalTime")} />
      </div>

      {/* Bazaning qancha qismi ko'rilgan */}
      <div className="flex flex-col gap-2 rounded-2xl bg-bg p-4">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <b>{t("profile.coverage")}</b>
          <span className="font-semibold text-muted">
            {stats.uniqueQuestionsSeen} / {stats.totalQuestions} · {seen}%
          </span>
        </div>
        <span className="block h-2.5 overflow-hidden rounded-full bg-soft">
          <span className="block h-full rounded-full bg-navy-2 transition-[width]" style={{ width: `${seen}%` }} />
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <QuickLink href={ROUTES.mistakes} icon={<RetryIcon size={18} />} tone="bg-tint-red text-bad-text" title={t("more.mistakes")} count={stats.mistakesCount} />
        <QuickLink href={ROUTES.saved} icon={<BookmarkIcon size={18} />} tone="bg-tint-yellow text-tint-yellow-fg" title={t("more.saved")} count={stats.bookmarksCount} />
      </div>

    </section>
  );
};

const Tile = ({ value, label, tone }: { value: React.ReactNode; label: string; tone?: "ok" }) => (
  <div className="flex flex-col gap-0.5 rounded-2xl border border-line px-4 py-3.5">
    <b className={cn("text-[22px] leading-tight font-extrabold", tone === "ok" && "text-ok-text")}>{value}</b>
    <span className="text-xs text-muted">{label}</span>
  </div>
);

type QuickLinkProps = { href: string; icon: React.ReactNode; tone: string; title: string; count: number };

const QuickLink = ({ href, icon, tone, title, count }: QuickLinkProps) => (
  <Link href={href} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3 text-ink no-underline hover:border-navy">
    <span className={cn("flex size-9 flex-none items-center justify-center rounded-xl", tone)}>{icon}</span>
    <b className="flex-1 text-sm">{title}</b>
    <span className="text-sm font-extrabold">{count}</span>
    <ChevronRightIcon size={16} className="text-subtle" />
  </Link>
);
