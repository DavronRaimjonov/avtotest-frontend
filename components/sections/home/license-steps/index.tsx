"use client";

import { useTranslation } from "react-i18next";
import { InfoIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/helpers";

// 3-qadam (nazariy imtihon) — platformaning o'zi, sariq bilan ajratiladi
const HIGHLIGHT = 2;

export const LicenseSteps = () => {
  const { t } = useTranslation();
  const steps = t("license.steps", { returnObjects: true }) as { title: string; text: string }[];

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24">
      <SectionHeading eyebrow={t("license.eyebrow")} title={t("license.title")} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-xl text-[15px] font-extrabold",
                i === HIGHLIGHT ? "bg-accent text-navy" : "bg-navy text-white",
              )}
            >
              0{i + 1}
            </span>
            <b className="text-[17px]">{s.title}</b>
            <span className="text-sm leading-normal text-muted">{s.text}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 mb-0 flex items-center gap-2 text-[13px] text-muted">
        <InfoIcon size={16} />
        {t("license.note")}
      </p>
    </section>
  );
};
