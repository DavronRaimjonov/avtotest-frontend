"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { TELEGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";
import { BrandMark, BrandName } from "../logo";

// footer.columns[i].links[j] matni shu jadvaldagi manzil bilan juftlanadi (tartib bir xil):
// string — ichki sahifa yoki bosh sahifa bo'limi (#id), "exam" — real imtihonni boshlash,
// tashqi manzil — yangi tabda, null — manzili hali yo'q (oddiy matn bo'lib turadi)
type FooterTarget = string | "exam" | null;

const FOOTER_TARGETS: FooterTarget[][] = [
  // BO'LIMLAR: Variantlar, Mavzular, Real imtihon, Yo'l belgilari
  [ROUTES.variants, "/#topics", "exam", ROUTES.signs],
  // FOYDALI: Prava olish tartibi, Imtihon qoidalari, YHQ matni, Yangiliklar
  ["/#license-steps", "/#exam-rules", null, null],
  // ALOQA: Telegram, bot, telefon — manzillar hali berilmagan
  [TELEGRAM_URL === "#" ? null : TELEGRAM_URL, null, null],
];

const linkClass = "w-fit text-left no-underline transition-colors hover:text-white";

export const Footer = () => {
  const { t } = useTranslation();
  const columns = t("footer.columns", { returnObjects: true }) as { title: string; links: string[] }[];
  const { start, isPending } = useStartAttempt();
  // Mobilda ustunlar accordion: bir vaqtda bittasi ochiq (null — hammasi yopiq). Kompyuterda hammasi ochiq
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const renderLink = (label: string, target: FooterTarget | undefined) => {
    if (target === "exam") {
      return (
        <button
          key={label}
          type="button"
          disabled={isPending}
          onClick={() => start({ source: "exam", mode: "exam" })}
          className={linkClass}
        >
          {label}
        </button>
      );
    }
    if (!target) return <span key={label}>{label}</span>;
    if (/^https?:\/\//.test(target)) {
      return (
        <a key={label} href={target} target="_blank" rel="noreferrer" className={linkClass}>
          {label}
        </a>
      );
    }
    return (
      <Link key={label} href={target} className={linkClass}>
        {label}
      </Link>
    );
  };

  return (
    <footer className="bg-navy text-[#B9C3DD]">
      <div className="mx-auto grid max-w-300 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 px-6 pt-14 pb-8 max-[860px]:grid-cols-1 max-[860px]:gap-0 max-[860px]:pt-10">
        <div className="flex flex-col gap-3">
          <Link href={ROUTES.home} className="flex w-fit items-center gap-2 no-underline">
            <BrandMark className="h-8 w-auto" />
            <BrandName className="text-xl" />
          </Link>
          <span className="text-sm leading-relaxed max-[860px]:pb-4">{t("footer.about")}</span>
        </div>
        {columns.map((col, i) => {
          const open = openIdx === i;
          return (
            <div key={col.title} className="flex flex-col gap-2.5 text-sm max-[860px]:gap-0 max-[860px]:border-b max-[860px]:border-white/10">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex items-center justify-between text-left text-xs font-bold tracking-[0.08em] text-white min-[861px]:pointer-events-none max-[860px]:py-4"
              >
                {col.title}
                <ChevronRightIcon
                  size={16}
                  strokeWidth={2.4}
                  className={cn("transition-transform min-[861px]:hidden", open && "rotate-90")}
                />
              </button>
              <div className={cn("flex flex-col gap-2.5", open ? "max-[860px]:pb-4" : "max-[860px]:hidden")}>
                {col.links.map((label, j) => renderLink(label, FOOTER_TARGETS[i]?.[j]))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mx-auto max-w-300 border-t border-white/10 px-6 pt-5 pb-8 text-[13px]">{t("footer.rights")}</div>
    </footer>
  );
};
