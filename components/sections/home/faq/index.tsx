"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";

export const Faq = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(0);
  const items = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section className="mx-auto max-w-220 px-6 pt-24">
      <h2 className="m-0 mb-8 text-center text-[32px] font-extrabold tracking-tight sm:text-[40px]">
        {t("faq.title")}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={cn(
                "rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200",
                isOpen ? "border-navy shadow-[0_12px_30px_-18px_rgba(14,26,58,.4)]" : "border-line",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 border-0 bg-transparent px-6 text-left text-base font-bold text-ink"
              >
                {f.q}
                <span
                  className={cn(
                    "flex size-8 flex-none items-center justify-center rounded-full transition-[transform,background,color] duration-300",
                    isOpen ? "rotate-45 bg-navy text-white" : "bg-bg text-navy",
                  )}
                >
                  <PlusIcon />
                </span>
              </button>
              {isOpen && (
                <p className="m-0 animate-fade-in px-6 pb-5.5 text-[15px] leading-relaxed text-muted">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
