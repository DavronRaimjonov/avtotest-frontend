"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AttemptQuestion } from "@/@types";
import { BookmarkIcon, FlagIcon, ManualIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";
import { AnswerOption, type OptionState } from "../answer-option";
import { QuestionImage } from "../question-image";
import { ReportForm } from "../report-form";

type Props = {
  question: AttemptQuestion;
  index: number;
  total: number;
  saved: boolean;
  onPick: (answerId: number) => void;
  onBookmark: () => void;
  // Mehmonga avval kirish oynasi, kirgach amal bajariladi
  requireLogin: (action: () => void) => () => void;
};

// isCorrect === null — javob serverdan kutilmoqda: faqat tanlangan belgilanadi
const optionState = (answerId: number, q: AttemptQuestion): OptionState => {
  if (q.myAnswerId === null) return "idle";
  if (q.isCorrect === null) return q.myAnswerId === answerId ? "selected" : "idle";
  if (answerId === q.correctAnswerId) return "correct";
  if (answerId === q.myAnswerId) return "wrong";
  return "idle";
};

export const QuestionView = ({ question, index, total, saved, onPick, onBookmark, requireLogin }: Props) => {
  const { t } = useTranslation();
  const [reporting, setReporting] = useState(false);
  // Ikkala rejimda bir marta javob beriladi: natija va izoh darhol ko'rinadi
  const locked = question.myAnswerId !== null;

  return (
    <div className="mx-auto flex w-full max-w-310 flex-1 flex-wrap items-start gap-7 px-4 pt-7 pb-30 sm:px-6">
      <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-3.5">
        <span className="text-sm font-bold text-muted">
          {t("test.question", { n: index + 1, total })}
        </span>
        <h1 className="m-0 mb-1.5 text-lg leading-snug font-extrabold tracking-tight sm:text-2xl">{question.text}</h1>
        {question.answers.map((a) => (
          <AnswerOption
            key={a.id}
            optionKey={`F${a.position}`}
            text={a.text}
            state={optionState(a.id, question)}
            disabled={locked}
            onClick={() => onPick(a.id)}
          />
        ))}
        {question.explanation && (
          <div className="mt-1.5 flex animate-fade-in gap-3.5 rounded-2xl border border-line bg-white px-5 py-4.5">
            <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-tint-blue text-navy-2">
              <ManualIcon />
            </span>
            <div className="flex flex-col gap-1">
              <b className="text-[15px]">{t("test.explanation")}</b>
              <span className="text-[15px] leading-relaxed text-slate">{question.explanation}</span>
            </div>
          </div>
        )}
      </section>

      <aside className="flex max-w-130 flex-[1_1_380px] flex-col gap-3 max-lg:order-first max-lg:max-w-none">
        <QuestionImage src={question.imageUrl} alt={question.text} noImage={t("test.noImage")} />
        <div className="flex flex-wrap gap-2 text-[13px] font-semibold text-muted">
          {question.topic && (
            <span className="rounded-lg border border-line bg-white px-2.5 py-1.5">{t("test.topic", { name: question.topic.name })}</span>
          )}
          <button
            type="button"
            aria-pressed={saved}
            onClick={onBookmark}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5",
              saved ? "border-navy bg-navy text-white" : "border-line bg-white text-slate",
            )}
          >
            <BookmarkIcon size={14} fill={saved ? "currentColor" : "none"} />
            {saved ? t("test.saved") : t("test.save")}
          </button>
          <button
            type="button"
            aria-expanded={reporting}
            onClick={reporting ? () => setReporting(false) : requireLogin(() => setReporting(true))}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-slate"
          >
            <FlagIcon size={14} />
            {t("test.report")}
          </button>
        </div>
        {reporting && <ReportForm questionId={question.id} onDone={() => setReporting(false)} />}
      </aside>
    </div>
  );
};
