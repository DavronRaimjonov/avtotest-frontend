"use client";

import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/helpers";

// Matnlar — categories.items (shu tartibda)
const CODES = [
  { code: "A", tone: "bg-tint-yellow text-tint-yellow-fg" },
  { code: "B", tone: "bg-tint-blue text-navy-2" },
  { code: "C", tone: "bg-tint-green text-ok-text" },
  { code: "D", tone: "bg-tint-red text-bad-text" },
  { code: "BE · CE · DE", tone: "bg-soft text-navy" },
];

export const Categories = () => {
  const { t } = useTranslation();
  const items = t("categories.items", { returnObjects: true }) as { title: string; text: string }[];

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24">
      <SectionHeading eyebrow={t("categories.eyebrow")} title={t("categories.title")} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        {CODES.map((c, i) => (
          <div key={c.code} className="lift flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-6">
            <span
              className={cn(
                "flex h-[52px] min-w-[52px] items-center justify-center self-start rounded-[14px] px-3.5 font-extrabold",
                c.code.length > 2 ? "text-base" : "text-2xl",
                c.tone,
              )}
            >
              {c.code}
            </span>
            <b className="text-[17px]">{items[i]?.title}</b>
            <span className="text-sm leading-normal text-muted">{items[i]?.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
