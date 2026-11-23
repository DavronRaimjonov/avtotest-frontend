"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { CheatSheetRef } from "@/@types";
import { ArrowRightIcon, ChevronLeftIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useCheatSheetQuery } from "@/hooks/useQuery";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { CheatSheetIcon, toneOf } from "../icons";

// /cheat-sheets/<slug> — sarlavha va tavsif, so'ng bo'limlar: kulrang sarlavha qatori, qatorlarda
// chapda katta yashil value (+ kichik unit), vertikal chiziq, o'ngda izoh. Pastda oldingi/keyingi kartochka
export const CheatSheetView = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending, isError } = useCheatSheetQuery(slug);

  return (
    <div className="mx-auto flex max-w-230 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 lg:pt-10">
      <Link href={ROUTES.cheatSheets} className="flex w-fit items-center gap-1.5 text-sm font-bold text-navy-2 no-underline">
        <ChevronLeftIcon size={16} />
        {t("cheatSheets.all")}
      </Link>

      {isError ? (
        <p className="m-0 font-semibold text-bad-text">{t("cheatSheets.notFound")}</p>
      ) : isPending ? (
        <>
          <span className="h-16 w-2/3 animate-pulse rounded-xl bg-soft" />
          <span className="h-72 animate-pulse rounded-[20px] bg-soft" />
          <span className="h-40 animate-pulse rounded-[20px] bg-soft" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className={cn("flex size-14 flex-none items-center justify-center rounded-2xl", toneOf(data.color))}>
              <CheatSheetIcon name={data.icon} size={26} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[32px]">{data.title}</h1>
              <p className="m-0 text-[15px] text-muted">{data.subtitle}</p>
            </div>
          </div>

          {data.sections.map((section) => (
            <section key={section.title} className="overflow-hidden rounded-[20px] border border-line bg-white">
              <h2 className="m-0 border-b border-line bg-bg px-5 py-3 text-sm font-bold text-slate">{section.title}</h2>
              <ul className="m-0 list-none p-0">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 border-t border-line px-5 py-3.5 first:border-t-0">
                    <span className="flex w-24 flex-none flex-col items-end text-right sm:w-28">
                      <b className="text-[22px] leading-tight font-extrabold wrap-break-word text-ok-text">{item.value}</b>
                      {item.unit && <span className="text-xs font-semibold text-muted">{item.unit}</span>}
                    </span>
                    <span className="w-px self-stretch bg-line" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink">{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {(data.prev || data.next) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.prev ? <Neighbour sheet={data.prev} label={t("cheatSheets.prev")} /> : <span className="max-sm:hidden" />}
              {data.next && <Neighbour sheet={data.next} label={t("cheatSheets.next")} next />}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Neighbour = ({ sheet, label, next }: { sheet: CheatSheetRef; label: string; next?: boolean }) => (
  <Link
    href={ROUTES.cheatSheet(sheet.slug)}
    className={cn(
      "flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-ink no-underline hover:border-navy",
      next && "flex-row-reverse text-right",
    )}
  >
    {next ? <ArrowRightIcon size={18} className="flex-none text-navy-2" /> : <ChevronLeftIcon size={18} className="flex-none text-navy-2" />}
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-xs font-bold tracking-wide text-muted uppercase">{label}</span>
      <b className="truncate">{sheet.title}</b>
    </span>
  </Link>
);
