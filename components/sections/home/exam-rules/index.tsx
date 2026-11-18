"use client";

import { useTranslation } from "react-i18next";
import { CheckIcon } from "@/components/ui/icons";
import { useMetaQuery } from "@/hooks/useQuery";
import { EXAM_DURATION_MIN, EXAM_QUESTION_COUNT, PASS_PERCENT } from "@/lib/constants";
import { cn } from "@/lib/helpers";

const TONE = { accent: "text-accent", ok: "text-[#4ADE80]", bad: "text-[#F87171]" };

export const ExamRules = () => {
  const { t } = useTranslation();
  // Raqamlar /meta dan (kelguncha rasmiy qiymatlar)
  const { data: meta } = useMetaQuery();
  const exam = meta?.exam ?? {
    questionCount: EXAM_QUESTION_COUNT,
    timeLimitMin: EXAM_DURATION_MIN,
    passPercent: PASS_PERCENT,
    maxMistakes: 2,
  };
  const tips = t("examRules.tips", { returnObjects: true }) as string[];
  const facts = [
    { value: exam.questionCount, label: t("examRules.facts.questions"), tone: "accent" },
    { value: exam.timeLimitMin, label: t("examRules.facts.minutes"), tone: "accent" },
    {
      value: exam.questionCount - exam.maxMistakes,
      label: t("examRules.facts.correct", { pass: exam.passPercent }),
      tone: "ok",
    },
    { value: exam.maxMistakes, label: t("examRules.facts.mistakes"), tone: "bad" },
  ] as const;

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24">
      <div className="flex flex-wrap gap-12 rounded-[28px] bg-navy p-8 text-white sm:p-12">
        <div className="flex flex-[1_1_380px] flex-col gap-4">
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-accent">{t("examRules.eyebrow")}</span>
          <h2 className="m-0 text-[36px] leading-tight font-extrabold tracking-tight">{t("examRules.title")}</h2>
          <p className="m-0 leading-relaxed text-pale">{t("examRules.text")}</p>
          <div className="flex flex-col gap-3 pt-2">
            <b className="text-[15px]">{t("examRules.tipsTitle")}</b>
            {tips.map((tip) => (
              <span key={tip} className="flex gap-2.5 text-[15px] leading-normal text-[#E2E8F6]">
                <CheckIcon strokeWidth={2.4} className="flex-none text-accent" />
                {tip}
              </span>
            ))}
          </div>
        </div>
        <div className="grid flex-[1_1_380px] grid-cols-2 content-center gap-3">
          {facts.map((f) => (
            <div key={f.label} className="lift flex flex-col gap-1.5 rounded-[20px] border border-white/10 bg-white/6 p-6">
              <b className={cn("text-[40px] leading-none font-extrabold", TONE[f.tone])}>{f.value}</b>
              <span className="text-sm text-pale">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
