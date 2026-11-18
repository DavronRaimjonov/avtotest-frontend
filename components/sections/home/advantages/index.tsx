"use client";

import { useTranslation } from "react-i18next";
import { ChartIcon, DevicesIcon, LanguagesIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";

// Matnlar — advantages.items (shu tartibda)
const ICONS = [
  { Icon: DevicesIcon, tone: "bg-tint-blue text-navy-2" },
  { Icon: LanguagesIcon, tone: "bg-tint-yellow text-tint-yellow-fg" },
  { Icon: ChartIcon, tone: "bg-tint-green text-ok-text" },
  { Icon: ShieldCheckIcon, tone: "bg-tint-red text-bad-text" },
];

export const Advantages = () => {
  const { t } = useTranslation();
  const items = t("advantages.items", { returnObjects: true }) as { title: string; text: string }[];

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24">
      <h2 className="m-0 mb-8 text-[32px] font-extrabold tracking-tight sm:text-[40px]">{t("advantages.title")}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {ICONS.map(({ Icon, tone }, i) => (
          <div key={i} className="lift flex gap-4 rounded-[20px] border border-line bg-white p-6">
            <span className={cn("ico flex size-12 flex-none items-center justify-center rounded-[14px]", tone)}>
              <Icon size={24} />
            </span>
            <span className="flex flex-col gap-1.5">
              <b className="text-[17px]">{items[i]?.title}</b>
              <span className="text-sm leading-normal text-muted">{items[i]?.text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
