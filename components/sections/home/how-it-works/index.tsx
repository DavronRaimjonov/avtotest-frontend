"use client";

import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/section-heading";

export const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = t("how.steps", { returnObjects: true }) as { title: string; text: string }[];

  return (
    <section className="mx-auto max-w-300 px-6 pt-24">
      <SectionHeading eyebrow={t("how.eyebrow")} title={t("how.title")} className="mb-10" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="group flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent"
          >
            <span className="text-[44px] leading-none font-extrabold text-line transition-colors duration-300 group-hover:text-accent">
              0{i + 1}
            </span>
            <b className="text-xl">{s.title}</b>
            <span className="text-[15px] leading-relaxed text-muted">{s.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
