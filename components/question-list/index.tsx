"use client";

import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Paginated, SavedQuestion } from "@/@types";
import { BookmarkIcon, PlayIcon, RetryIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { MAX_TEST_COUNT, MY_TEST_SIZES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";
import { useAuthStore } from "@/store/auth.store";
import { QuestionCard } from "./question-card";

type Kind = "saved" | "mistakes";

type Props<T extends SavedQuestion> = {
  kind: Kind;
  query: UseInfiniteQueryResult<InfiniteData<Paginated<T>>>;
  meta: (item: T, formatDate: (iso: string) => string) => React.ReactNode;
  // Faqat "Xatolarim": karta foydalanuvchi tanlagan javobni qizil bilan ko'rsatadi
  myAnswerId?: (item: T) => number | null;
  onRemove: (questionId: number) => void;
  // Sarlavha ostidagi qo'shimcha blok (Xatolarim: aqlli takrorlash kartasi)
  header?: React.ReactNode;
};

const SOURCE = { saved: "bookmarks", mistakes: "mistakes" } as const;

// "Saqlangan savollar" (/saved) va "Xatolarim" (/mistakes): sarlavha, tepada qotib turadigan test paneli
// (20 / 50 / hammasi), ixcham accordion kartalar, oxiriga yetganda keyingi 20 tasi o'zi yuklanadi.
// Faqat kirganlarga (proxy tokensizni /variants ga qaytaradi)
export const QuestionList = <T extends SavedQuestion>({ kind, query, meta, myAnswerId, onRemove, header }: Props<T>) => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { start, isPending: starting } = useStartAttempt();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  // Eng oxirgi sahifadagi total — olib tashlashdan keyin ham to'g'ri
  const total = data?.pages.at(-1)?.total ?? 0;

  // Shu ro'yxatdan mashq rejimida test: 20, 50 yoki hammasi (backend chegarasi 200)
  const all = Math.min(total, MAX_TEST_COUNT);
  const sizes = [...MY_TEST_SIZES.filter((n) => n < all), all];
  const startTest = (count: number) => start({ source: SOURCE[kind], mode: "practice", count });

  // Ro'yxat oxiri ko'rinishiga yaqinlashganda keyingi sahifa (tugma — zaxira)
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && !isFetchingNextPage && fetchNextPage(),
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const Icon = kind === "saved" ? BookmarkIcon : RetryIcon;

  // Sessiya tugagan (cookie bor, lekin tizimdan chiqilgan) — kirish taklifi
  if (!hasSession) {
    return (
      <Shell>
        <State
          icon={<Icon size={28} />}
          title={t("questions.loginTitle")}
          text={t("questions.loginText")}
          action={
            <button type="button" onClick={() => openLogin()} className={primaryBtn}>
              {t("common.login")}
            </button>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="m-0 text-[28px] font-extrabold tracking-tight sm:text-[32px]">{t(`${kind}.title`)}</h1>
        <span className="text-[15px] text-muted">
          {isPending ? t("questions.loading") : `${t("questions.count", { count: total })} · ${t(`${kind}.subtitle`)}`}
        </span>
      </div>

      {header}

      {/* Header ostida qotib turadi: ro'yxat qancha uzun bo'lsa ham test bir bosishda */}
      {total > 0 && (
        <div className="sticky top-15 z-30 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 min-[861px]:top-18">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-2 pl-3.5 shadow-sm">
            <span className="mr-auto flex items-center gap-2 text-sm font-bold text-ink">
              <PlayIcon size={14} className="text-navy-2" />
              {starting ? t("common.starting") : t("questions.startTest")}
            </span>
            {sizes.map((n, i) => {
              const isAll = i === sizes.length - 1;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={starting}
                  onClick={() => startTest(n)}
                  className={cn(
                    "h-10 rounded-xl px-3.5 text-sm font-bold disabled:opacity-60",
                    isAll ? "btn-hover bg-accent text-navy" : "border-[1.5px] border-line bg-white text-navy hover:border-navy",
                  )}
                >
                  {isAll && sizes.length > 1 ? t("questions.all", { count: n }) : t("modes.big.count", { count: n })}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col gap-4" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20.5 animate-pulse rounded-2xl bg-soft sm:h-24" />
          ))}
        </div>
      )}

      {isError && (
        <State
          icon={<Icon size={28} />}
          title={t("questions.error")}
          action={
            <button type="button" onClick={() => refetch()} className={secondaryBtn}>
              {t("common.retry")}
            </button>
          }
        />
      )}

      {!isPending && !isError && items.length === 0 && (
        <State
          icon={<Icon size={28} />}
          title={t(`${kind}.emptyTitle`)}
          text={t(`${kind}.emptyText`)}
          action={
            <Link href={ROUTES.variants} className={primaryBtn}>
              {t("common.variants")}
            </Link>
          }
        />
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              meta={meta(item, formatDate)}
              myAnswerId={myAnswerId?.(item)}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </div>
      )}

      <div ref={sentinel} aria-hidden="true" />
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className={`${secondaryBtn} self-center`}
        >
          {isFetchingNextPage ? t("questions.loading") : t("questions.loadMore")}
        </button>
      )}
    </Shell>
  );
};

const primaryBtn =
  "btn-hover flex h-12 items-center justify-center gap-2 rounded-[14px] bg-accent px-5 font-extrabold text-navy no-underline disabled:opacity-60";
const secondaryBtn =
  "flex h-12 items-center justify-center rounded-[14px] border-[1.5px] border-navy bg-white px-5 font-bold text-navy disabled:opacity-60";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-230 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 lg:pt-10">{children}</div>
);

const State = ({ icon, title, text, action }: { icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-3 rounded-[20px] border border-line bg-white px-6 py-12 text-center">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-bg text-navy-2">{icon}</span>
    <b className="text-lg">{title}</b>
    {text && <p className="m-0 max-w-md text-[15px] leading-relaxed text-muted">{text}</p>}
    {action && <div className="pt-2">{action}</div>}
  </div>
);
