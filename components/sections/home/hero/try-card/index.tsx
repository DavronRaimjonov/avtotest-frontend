"use client";

import Image from "next/image";
import { Link } from "@/components/ui/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnswerOption } from "@/components/test/answer-option";
import { ArrowRightIcon, InfoIcon, RefreshIcon } from "@/components/ui/icons";
import { useDemoQuestionQuery } from "@/hooks/useQuery";
import { ROUTES } from "@/lib/routes";

// "Sinab ko'ring": backenddan tasodifiy rasmli savol to'g'ri javobi bilan keladi, tekshiruv shu yerda
export const TryCard = () => {
  const { t } = useTranslation();
  const { data: q, isPending, isError, isFetching, refetch } = useDemoQuestionQuery();
  const [picked, setPicked] = useState<number | null>(null);

  const next = () => {
    setPicked(null);
    refetch();
  };

  return (
    <div className="animate-card-in">
      <div className="flex animate-float flex-col gap-4 rounded-3xl bg-white p-6 text-ink shadow-float">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold tracking-[0.08em] text-muted">{t("try.label")}</span>
          <button
            type="button"
            onClick={next}
            disabled={isFetching}
            aria-label={t("try.another")}
            className="flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[13px] font-bold text-muted disabled:opacity-60"
          >
            <RefreshIcon size={14} className={isFetching ? "animate-spin" : undefined} />
            {t("try.another")}
          </button>
        </div>

        {isPending || (isFetching && !picked) ? (
          <TrySkeleton />
        ) : isError || !q ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl bg-bg text-center text-sm text-muted">
            {t("try.loadError")}
            <button type="button" onClick={next} className="h-10 rounded-[10px] bg-navy px-4 font-bold text-white">
              {t("common.retry")}
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-[168px] overflow-hidden rounded-2xl bg-img">
              {q.imageUrl && <Image src={q.imageUrl} alt="" fill unoptimized className="object-contain" />}
            </div>

            <p className="m-0 text-[17px] leading-snug font-bold">{q.text}</p>

            <div className="flex flex-col gap-2">
              {q.answers.map((a, i) => (
                <AnswerOption
                  key={a.id}
                  size="sm"
                  optionKey={`F${a.position}`}
                  text={a.text}
                  disabled={picked !== null}
                  onClick={() => setPicked(a.id)}
                  state={
                    picked !== null && a.id === q.correctAnswerId ? "correct" : picked === a.id ? "wrong" : "idle"
                  }
                  className={picked !== null ? undefined : "animate-up bg-bg"}
                  style={picked !== null ? undefined : { animationDelay: `${0.1 + i * 0.08}s` }}
                />
              ))}
            </div>

            {picked === null ? (
              <span className="text-sm text-muted">{t("try.pick")}</span>
            ) : (
              <div className="flex animate-fade-in items-start gap-3 rounded-[14px] bg-bg px-4 py-3.5 text-sm leading-normal text-slate">
                <InfoIcon className="mt-px flex-none text-navy-2" />
                <span>
                  <b>{picked === q.correctAnswerId ? t("try.correct") : t("try.wrong")}</b>{" "}
                  {t("try.noExplanation")}
                </span>
              </div>
            )}
          </>
        )}

        <Link
          href={ROUTES.variants}
          className="btn-hover flex h-12 items-center justify-center gap-2 rounded-xl bg-navy text-[15px] font-bold text-white no-underline"
        >
          {t("try.continue")}
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </div>
  );
};

const TrySkeleton = () => (
  <>
    <span className="h-[168px] animate-pulse rounded-2xl bg-soft" />
    <span className="h-12 animate-pulse rounded-lg bg-soft" />
    {[0, 1, 2].map((i) => (
      <span key={i} className="h-[52px] animate-pulse rounded-xl bg-soft" />
    ))}
  </>
);
