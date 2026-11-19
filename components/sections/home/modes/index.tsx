"use client";

import { Link } from "@/components/ui/link";
import { useTranslation } from "react-i18next";
import type { StartAttemptBody } from "@/@types";
import {
  BookIcon,
  ChevronRightIcon,
  ClockIcon,
  GridIcon,
  RetryIcon,
  SignIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { BIG_TEST_COUNTS } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "@/hooks/useRouter";
import { useStartAttempt } from "@/request/mutation";
import { useAuthStore } from "@/store/auth.store";

// href — sahifaga o'tish, start — darhol test (mehmon /guest, kirgan /attempts).
// auth — sahifa faqat kirganlarga: mehmonga login oynasi, kirgach sahifaga o'tadi. Matn — modes.<key>.title / .text
type Item = {
  key: string;
  href?: string;
  auth?: boolean;
  start?: StartAttemptBody;
  Icon: typeof ClockIcon;
  tone: string;
};

const MODES: Item[] = [
  { key: "exam", start: { source: "random", mode: "exam", count: 20 }, Icon: ClockIcon, tone: "bg-tint-yellow text-tint-yellow-fg" },
  { key: "variants", href: ROUTES.variants, Icon: GridIcon, tone: "bg-tint-blue text-navy-2" },
  { key: "topics", href: "#topics", Icon: BookIcon, tone: "bg-tint-green text-ok-text" },
  { key: "mistakes", href: ROUTES.mistakes, auth: true, Icon: RetryIcon, tone: "bg-tint-red text-bad-text" },
];

const TOOLS: Item[] = [
  { key: "hard", start: { source: "hard", mode: "practice" }, Icon: WarningIcon, tone: "text-[#D62828]" },
  { key: "signs", href: ROUTES.signs, Icon: SignIcon, tone: "text-navy-2" },
];

const cardClass =
  "lift flex animate-up flex-col gap-3.5 rounded-[20px] border border-line bg-white p-6 text-left text-ink no-underline shadow-card disabled:opacity-60";
const toolClass =
  "lift flex items-center gap-4 rounded-[20px] border border-line bg-white px-6 py-[22px] text-left text-ink no-underline disabled:opacity-60";

export const Modes = () => {
  const { t } = useTranslation();
  const { start, isPending } = useStartAttempt();
  const router = useRouter();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);

  // Bir xil ko'rinish: start yoki mehmonga yopiq sahifa bo'lsa tugma, aks holda havola
  const action = (item: Item, className: string, content: React.ReactNode, style?: React.CSSProperties) =>
    item.start ? (
      <button
        key={item.key}
        type="button"
        disabled={isPending}
        onClick={() => start(item.start!)}
        className={className}
        style={style}
      >
        {content}
      </button>
    ) : item.auth && !hasSession ? (
      <button
        key={item.key}
        type="button"
        onClick={() => openLogin(() => router.push(item.href!))}
        className={className}
        style={style}
      >
        {content}
      </button>
    ) : (
      <Link key={item.key} href={item.href ?? ROUTES.variants} className={className} style={style}>
        {content}
      </Link>
    );

  return (
    <>
      <section className="relative z-[2] mx-auto -mt-12 max-w-[1200px] px-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {MODES.map((item, i) =>
            action(
              item,
              cardClass,
              <>
                <span className={cn("ico flex size-12 items-center justify-center rounded-[14px]", item.tone)}>
                  <item.Icon size={24} />
                </span>
                <span className="text-lg font-extrabold">{t(`modes.${item.key}.title`)}</span>
                <span className="text-sm leading-normal text-muted">{t(`modes.${item.key}.text`)}</span>
              </>,
              { animationDelay: `${0.28 + i * 0.12}s` },
            ),
          )}
        </div>
      </section>

      {/* Katta testlar: aralash savollar, imtihon sharoitida (vaqt va xatolar limiti bilan) */}
      <section className="mx-auto max-w-[1200px] px-6 pt-6">
        <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-line bg-white px-6 py-5">
          <span className="flex flex-[1_1_260px] flex-col gap-0.5">
            <b>{t("modes.big.title")}</b>
            <span className="text-[13px] text-muted">{t("modes.big.text")}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {BIG_TEST_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                disabled={isPending}
                onClick={() => start({ source: "random", mode: "exam", count })}
                className="btn-hover h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white disabled:opacity-60"
              >
                {t("modes.big.count", { count })}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pt-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {TOOLS.map((item) =>
            action(
              item,
              toolClass,
              <>
                <item.Icon size={28} className={cn("ico", item.tone)} />
                <span className="flex flex-1 flex-col gap-0.5">
                  <b>{t(`modes.${item.key}.title`)}</b>
                  <span className="text-[13px] text-muted">{t(`modes.${item.key}.text`)}</span>
                </span>
                <ChevronRightIcon strokeWidth={2} className="text-muted" />
              </>,
            ),
          )}
        </div>
      </section>
    </>
  );
};
