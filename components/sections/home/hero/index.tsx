"use client";

import { Link } from "@/components/ui/link";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  ChecklistIcon,
  ClockIcon,
  GridIcon,
  PlayIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import { TryCard } from "./try-card";

const FACT_ICONS = [ChecklistIcon, ClockIcon, ShieldIcon, CheckIcon];

export const Hero = () => {
  const { t } = useTranslation();
  const facts = t("hero.facts", { returnObjects: true }) as string[];
  return (
  <section className="relative overflow-hidden bg-navy pt-14 pb-24 text-white">
    <div className="relative z-[1] mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-center gap-14 px-6">
      <div className="flex flex-col gap-6">
        <span className="inline-flex animate-up items-center gap-2 self-start rounded-full bg-accent/12 px-3 py-1.5 text-[13px] font-bold text-accent [animation-delay:.05s]">
          <span className="size-2 animate-pulse-ring rounded-full bg-accent" />
          {t("hero.badge")}
        </span>
        <h1 className="m-0 animate-up text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] [animation-delay:.15s] min-[861px]:text-[56px]">
          {t("hero.title")}
        </h1>
        <p className="m-0 max-w-[520px] animate-up text-lg leading-relaxed text-pale [animation-delay:.28s]">
          {t("hero.text")}
        </p>
        <div className="flex animate-up flex-wrap gap-3 [animation-delay:.4s]">
          <Link
            href={ROUTES.variants}
            className="btn-hover shine flex h-14 items-center gap-2.5 rounded-[14px] bg-accent px-7 text-[17px] font-extrabold text-navy no-underline"
          >
            <PlayIcon />
            {t("common.start")}
          </Link>
          <Link
            href={ROUTES.variants}
            className="btn-hover flex h-14 items-center gap-2.5 rounded-[14px] border-[1.5px] border-white/30 px-6 font-bold text-white no-underline"
          >
            <GridIcon size={18} />
            {t("common.variants")}
          </Link>
        </div>
        <div className="flex animate-up flex-wrap gap-6 pt-2 text-sm font-semibold text-pale [animation-delay:.52s]">
          {facts.map((fact, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <span key={fact} className="flex items-center gap-2">
                <Icon size={18} strokeWidth={2} className="text-accent" />
                {fact}
              </span>
            );
          })}
        </div>
      </div>
      <TryCard />
    </div>
  </section>
  );
};
