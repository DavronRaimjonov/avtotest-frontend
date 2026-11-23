"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ResultData, ReviewItem } from "@/@types";
import { LockedExplanation } from "@/components/billing/locked-explanation";
import { cn } from "@/lib/helpers";

const answerText = (item: ReviewItem, id: number | null) =>
  item.answers.find((a) => a.id === id)?.text;

// explanationsLocked — mehmon yoki tarifsiz: izoh o'rnida "tarif oling" bloki. Faqat review kerak (jamoaviy test natijasi ham ishlatadi)
export const ResultReview = ({
  result,
  explanationsLocked = false,
}: {
  result: Pick<ResultData, "review">;
  explanationsLocked?: boolean;
}) => {
  const { t } = useTranslation();
  const [onlyWrong, setOnlyWrong] = useState(false);
  const wrongItems = result.review.filter((i) => !i.isCorrect);
  const list = onlyWrong ? wrongItems : result.review;

  return (
    <section className="flex flex-col gap-4.5 rounded-[28px] border border-line bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[22px] font-extrabold">
          {t("result.review.title")}
        </h2>
        <div className="flex gap-1.5 rounded-xl bg-bg p-1">
          {[
            { v: false, l: t("result.review.all") },
            { v: true, l: t("result.review.onlyWrong") },
          ].map((t) => (
            <button
              key={t.l}
              type="button"
              aria-pressed={onlyWrong === t.v}
              onClick={() => setOnlyWrong(t.v)}
              className={cn(
                "h-9 rounded-[9px] border-0 px-3.5 text-[13px] font-bold",
                onlyWrong === t.v
                  ? "bg-navy text-white"
                  : "bg-transparent text-slate",
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {result.review.map((i) => (
          <span
            key={i.id}
            className={cn(
              "flex h-10 items-center justify-center rounded-[10px] border-[1.5px] text-sm font-bold",
              i.isCorrect
                ? "border-ok-line bg-ok-bg text-ok-text"
                : "border-bad-line bg-bad-bg text-bad-text",
            )}
          >
            {i.number}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-1.5">
        {list.length === 0 && (
          <p className="m-0 text-[15px] text-muted">
            {t("result.review.noMistakes")}
          </p>
        )}
        {list.map((i) => (
          <div
            key={i.id}
            className={cn(
              "flex flex-col gap-2.5 rounded-[18px] border-[1.5px] px-5 py-4.5",
              i.isCorrect
                ? "border-ok-line bg-[#F5FBF7]"
                : "border-bad-line bg-[#FFF7F7]",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-extrabold text-white",
                  i.isCorrect ? "bg-ok" : "bg-bad",
                )}
              >
                {t("result.review.number", { n: i.number })}
              </span>
              {i.topic && (
                <span className="text-[13px] font-semibold text-muted">
                  {i.topic.name}
                </span>
              )}
            </div>
            <b className="leading-normal">{i.text}</b>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              {!i.isCorrect && (
                <span className="rounded-[10px] bg-bad-bg px-3 py-2 text-bad-text">
                  {i.myAnswerId === null
                    ? t("result.review.noAnswer")
                    : t("result.review.yourAnswer", {
                        text: answerText(i, i.myAnswerId),
                      })}
                </span>
              )}
              <span className="rounded-[10px] bg-ok-bg px-3 py-2 text-ok-text">
                {t("result.review.correct", {
                  text: answerText(i, i.correctAnswerId),
                })}
              </span>
            </div>
            {explanationsLocked ? (
              <LockedExplanation />
            ) : (
              i.explanation && (
                <p className="m-0 text-sm leading-relaxed text-slate">
                  {i.explanation}
                </p>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
