"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { attemptTitle } from "@/components/test/test-header";
import { useAttemptsQuery } from "@/hooks/useQuery";
import { cn, formatDate } from "@/lib/helpers";
import { attemptHref } from "@/lib/routes";

const PAGE_SIZE = 10;

// Testlar tarixi (GET /attempts): yakunlangani — natijaga, tugallanmagani — "Davom ettirish"
export const ProfileHistory = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData } = useAttemptsQuery({ page, limit: PAGE_SIZE });
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-extrabold">{t("profile.historyTitle")}</h2>
        {data && data.total > 0 && <span className="text-sm font-semibold text-muted">{data.total}</span>}
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="h-16 animate-pulse rounded-2xl bg-soft" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-bg p-5">
          <span className="text-sm text-muted">{t("profile.historyEmpty")}</span>
          <Link href="/variants" className="btn-hover flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-extrabold text-navy no-underline">
            {t("common.start")}
          </Link>
        </div>
      ) : (
        <ul className={cn("m-0 flex list-none flex-col p-0 transition-opacity", isPlaceholderData && "opacity-60")}>
          {data.items.map((a) => {
            const finished = a.status === "finished";
            return (
              <li key={a.id} className="border-t border-line first:border-t-0">
                <Link href={attemptHref(a)} className="flex items-center gap-3 py-3 text-ink no-underline hover:bg-bg sm:px-2">
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <b className="truncate text-[15px]">{attemptTitle(t, a)}</b>
                    <span className="truncate text-[13px] text-muted">
                      {t(`mode.${a.mode}.title`)} · {a.questionCount} {t("variants.questions")} · {formatDate(a.finishedAt ?? a.startedAt)}
                    </span>
                  </span>
                  {finished ? (
                    <span
                      className={cn(
                        "flex-none rounded-full px-3 py-1 text-sm font-extrabold",
                        a.passed ? "bg-ok-bg text-ok-text" : "bg-warn-bg text-warn-text",
                      )}
                    >
                      {a.percent ?? 0}%
                    </span>
                  ) : (
                    <span className="flex-none rounded-full bg-tint-blue px-3 py-1 text-[13px] font-bold text-navy-2">
                      {t("result.continue")}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label={t("test.prev")}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex size-10 items-center justify-center rounded-xl border border-line text-slate hover:border-navy disabled:opacity-40"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <span className="text-sm font-bold text-muted">
            {page} / {pages}
          </span>
          <button
            type="button"
            aria-label={t("test.next")}
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="flex size-10 items-center justify-center rounded-xl border border-line text-slate hover:border-navy disabled:opacity-40"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>
      )}
    </section>
  );
};
