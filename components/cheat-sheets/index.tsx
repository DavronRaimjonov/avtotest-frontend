"use client";

import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useCheatSheetsQuery } from "@/hooks/useQuery";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { CheatSheetIcon, toneOf } from "./icons";

// /cheat-sheets — kartochkalar: rangli ikonka, nomi, tavsifi, raqamlar soni. Login va tarif shart emas
export const CheatSheets = () => {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useCheatSheetsQuery();

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-7 px-4 pt-8 pb-16 sm:px-6 lg:pt-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[32px] font-extrabold tracking-tight">{t("cheatSheets.title")}</h1>
        <p className="m-0 text-[15px] text-muted">{t("cheatSheets.subtitle")}</p>
      </div>

      {isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="m-0 text-muted">{t("cheatSheets.loadError")}</p>
          <button type="button" onClick={() => refetch()} className="h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white">
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
          {isPending
            ? Array.from({ length: 9 }, (_, i) => <span key={i} className="h-28 animate-pulse rounded-[20px] bg-soft" />)
            : data.map((card, i) => (
                <Link
                  key={card.id}
                  href={ROUTES.cheatSheet(card.slug)}
                  className="lift flex animate-up items-center gap-4 rounded-[20px] border border-line bg-white p-5 text-ink no-underline"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className={cn("ico flex size-12 flex-none items-center justify-center rounded-[14px]", toneOf(card.color))}>
                    <CheatSheetIcon name={card.icon} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <b className="text-base leading-snug">{card.title}</b>
                    <span className="text-[13px] leading-snug text-muted">{card.subtitle}</span>
                    <span className="pt-1 text-xs font-bold text-navy-2">{t("cheatSheets.count", { count: card.itemCount })}</span>
                  </span>
                  <ChevronRightIcon size={18} className="flex-none text-subtle" />
                </Link>
              ))}
        </div>
      )}
    </div>
  );
};
