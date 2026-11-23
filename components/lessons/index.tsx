"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, ChevronRightIcon, PlayIcon, XIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { usePaywallStore } from "@/store/paywall.store";
import { type LessonState, useLessons } from "./use-lessons";

// /lessons — chapda darslar (raqam, mavzular, progress, yopiqlarida "To'liq dostup uchun to'lash"),
// o'ngda tanlangan darsning mavzulari. Mobilda mavzular tanlangan dars ostida ochiladi
export const Lessons = () => {
  const { t } = useTranslation();
  const initial = Number(useSearchParams().get("lesson")) || 1;
  const [selected, setSelected] = useState(initial);
  const { lessons, isPending, isError, refetch } = useLessons();
  const current = lessons.find((l) => l.number === selected) ?? lessons[0];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 lg:pt-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[32px] font-extrabold tracking-tight">{t("lessons.title")}</h1>
        <p className="m-0 text-[15px] text-muted">{t("lessons.subtitle")}</p>
      </div>

      {isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="m-0 text-muted">{t("lessons.loadError")}</p>
          <button type="button" onClick={() => refetch()} className="h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white">
            {t("common.retry")}
          </button>
        </div>
      ) : isPending ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          <span className="h-130 animate-pulse rounded-[20px] bg-soft lg:w-105" />
          <span className="h-100 flex-1 animate-pulse rounded-[20px] bg-soft" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[20px] border border-line bg-white p-0 lg:w-105 lg:flex-none">
            {lessons.map((lesson) => {
              const active = lesson.number === current?.number;
              return (
                <li key={lesson.number} className="border-t border-line first:border-t-0">
                  <LessonRow lesson={lesson} active={active} onSelect={() => setSelected(lesson.number)} />
                  {/* Mobil: mavzular shu dars ostida */}
                  {active && (
                    <div className="border-t border-line bg-bg p-3 lg:hidden">
                      <TopicList lesson={lesson} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {current && (
            <section className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex">
              <div className="flex flex-col gap-0.5">
                <h2 className="m-0 text-xl font-extrabold">{t("lessons.lesson", { n: current.number })}</h2>
                <span className="text-sm text-muted">
                  {t("lessons.progress", { count: current.items.length, done: current.done })}
                </span>
              </div>
              <TopicList lesson={current} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};

// Dars qatori. Yopiq darsda matn ostida "To'liq dostup uchun to'lash →" (tugma ichida tugma bo'lmasligi uchun alohida)
const LessonRow = ({ lesson, active, onSelect }: { lesson: LessonState; active: boolean; onSelect: () => void }) => {
  const { t } = useTranslation();
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  return (
    <div className={cn("flex flex-col transition-colors", active ? "bg-tint-blue" : "hover:bg-bg")}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={cn("flex w-full items-start gap-3.5 px-4 pt-3.5 text-left", lesson.locked ? "pb-1" : "pb-3.5")}
      >
        <span
          className={cn(
            "flex size-10 flex-none items-center justify-center rounded-xl text-[15px] font-extrabold",
            active ? "bg-white text-navy-2" : "bg-bg text-slate",
          )}
        >
          {lesson.number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-3">
            <b className={cn("text-[15px]", lesson.locked && !active && "text-slate")}>
              {t("lessons.lesson", { n: lesson.number })}
            </b>
            <span className="flex-none text-[13px] font-semibold text-muted">
              {lesson.done} / {lesson.items.length}
            </span>
          </span>
          <span className="truncate text-[13px] text-muted">{lesson.topics.map((x) => x.name).join(", ")}</span>
        </span>
      </button>
      {lesson.locked && (
        <button
          type="button"
          onClick={() => openPaywall("videos")}
          className="ml-17.5 flex w-fit items-center gap-1 pb-3.5 text-[13px] font-bold text-navy-2 hover:underline"
        >
          {t("lessons.unlock")}
          <ArrowRightIcon size={13} />
        </button>
      )}
    </div>
  );
};

// Darsning mavzulari: ochig'i — video dars sahifasiga, yopig'i — paywall oynasi
const TopicList = ({ lesson }: { lesson: LessonState }) => {
  const { t } = useTranslation();
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  return (
    <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[20px] border border-line bg-white p-0">
      {lesson.items.map(({ topic, open, done }) => {
        const content = (
          <>
            <span
              className={cn(
                "flex size-8 flex-none items-center justify-center rounded-full border-[1.5px]",
                open ? "border-navy-2 text-navy-2" : "border-pale text-subtle",
              )}
            >
              {open ? <PlayIcon size={12} /> : <XIcon size={12} strokeWidth={2.6} />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <b className={cn("text-[15px] leading-snug", open ? "text-ink" : "font-semibold text-slate")}>{topic.name}</b>
              <span className={cn("text-[13px]", open && done ? "font-semibold text-ok-text" : "text-muted")}>
                {!open ? t("lessons.locked") : done ? t("lessons.done") : t("lessons.start")}
              </span>
            </span>
            <ChevronRightIcon size={16} className={open ? "text-muted" : "text-pale"} />
          </>
        );
        const className = "flex w-full items-center gap-3.5 px-4 py-3.5 text-left text-ink no-underline hover:bg-bg";
        return (
          <li key={topic.id} className="border-t border-line first:border-t-0">
            {open ? (
              <Link href={ROUTES.lesson(topic.slug)} className={className}>
                {content}
              </Link>
            ) : (
              <button type="button" onClick={() => openPaywall("videos")} className={className}>
                {content}
              </button>
            )}
          </li>
        );
      })}
      {lesson.locked && (
        <li className="border-t border-line">
          <button
            type="button"
            onClick={() => openPaywall("videos")}
            className="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[13px] font-bold text-navy-2 hover:bg-bg"
          >
            {t("lessons.unlock")}
            <ArrowRightIcon size={14} />
          </button>
        </li>
      )}
    </ul>
  );
};
