"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, ChevronLeftIcon, LockIcon, PlayIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";
import { usePaywallStore } from "@/store/paywall.store";
import { useLessons } from "../use-lessons";

// /lessons/<mavzu> — video dars: "← VIDEO DARS" paneli, sarlavha, video oynasi va "Testni boshlash"
// (shu mavzu bo'yicha test). Video fayllar hali yo'q — oynada "Videodars tez kunda" ko'rsatiladi
export const LessonView = () => {
  const { t } = useTranslation();
  const { topic: slug } = useParams<{ topic: string }>();
  const { lessons, isPending } = useLessons();
  const { start, isPending: starting } = useStartAttempt();
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  // Barcha mavzular tartib bilan — "keyingi mavzu" uchun
  const flat = lessons.flatMap((l) => l.items.map((item) => ({ ...item, lesson: l.number })));
  const index = flat.findIndex((x) => x.topic.slug === slug);
  const current = flat[index];
  const next = index >= 0 ? flat[index + 1] : undefined;

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-230 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
        <span className="h-14 animate-pulse rounded-2xl bg-soft" />
        <span className="mx-auto h-10 w-2/3 animate-pulse rounded-xl bg-soft" />
        <span className="aspect-video animate-pulse rounded-[28px] bg-soft" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto flex max-w-230 flex-col items-start gap-4 px-4 py-20 sm:px-6">
        <h1 className="m-0 text-3xl font-extrabold">{t("lessons.notFound")}</h1>
        <Link href={ROUTES.lessons()} className="flex h-12 items-center rounded-xl bg-accent px-6 font-extrabold text-navy no-underline">
          {t("lessons.all")}
        </Link>
      </div>
    );
  }

  const { topic, open, lesson } = current;

  return (
    <div className="mx-auto flex max-w-230 flex-col gap-7 px-4 pt-8 pb-16 sm:px-6">
      <Link
        href={ROUTES.lessons(lesson)}
        className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-white px-4 text-[13px] font-bold tracking-[0.06em] text-slate uppercase no-underline hover:border-navy"
      >
        <ChevronLeftIcon size={18} className="text-ink" />
        {t("lessons.back")}
        <span className="ml-auto text-xs font-semibold tracking-normal text-muted normal-case">
          {t("lessons.lesson", { n: lesson })}
        </span>
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[40px]">{topic.name}</h1>
        <p className="m-0 text-[15px] text-muted">{t("lessons.watchHint")}</p>
      </div>

      {/* Video oynasi: hozircha joy egallovchi. Yopiq mavzuda — tarif taklifi */}
      <div className="rounded-[28px] border border-line bg-white p-2">
        <div
          className={cn(
            "relative flex aspect-video flex-col items-center justify-center gap-4 overflow-hidden rounded-[22px] px-6 text-center text-white",
            "bg-[radial-gradient(120%_90%_at_50%_0%,#2f4a8a_0%,#0e1a3a_70%)]",
          )}
        >
          <span className="absolute top-4 left-4 flex items-center gap-2 text-left">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-extrabold text-accent">
              {lesson}
            </span>
            <span className="flex flex-col">
              <b className="text-sm leading-tight">{topic.name}</b>
              <span className="text-xs text-pale">{t("lessons.lesson", { n: lesson })}</span>
            </span>
          </span>
          {open ? (
            <>
              <span className="flex size-18 items-center justify-center rounded-full bg-accent text-navy shadow-float sm:size-20">
                <PlayIcon size={30} />
              </span>
              <span className="flex flex-col items-center gap-1">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-accent uppercase">
                  {t("lessons.soon")}
                </span>
                <span className="max-w-105 text-sm text-pale">{t("lessons.soonText")}</span>
              </span>
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-accent">
                <LockIcon size={28} />
              </span>
              <span className="flex flex-col items-center gap-1">
                <b className="text-lg">{t("lessons.lockedTitle")}</b>
                <span className="max-w-105 text-sm text-pale">{t("paywall.videos")}</span>
              </span>
              <button
                type="button"
                onClick={() => openPaywall("videos")}
                className="btn-hover h-11 rounded-xl bg-accent px-5 text-sm font-extrabold text-navy"
              >
                {t("paywall.cta")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={starting || topic.questionCount === 0}
          onClick={() => start({ source: "topic", topicId: topic.id, mode: "practice" })}
          className="btn-hover flex h-14 items-center gap-2.5 rounded-2xl bg-navy-2 px-8 text-base font-extrabold text-white disabled:opacity-60"
        >
          <PlayIcon />
          {starting ? t("common.starting") : t("lessons.startTest")}
        </button>
        <span className="text-[13px] text-muted">{t("lessons.questions", { count: topic.questionCount })}</span>
      </div>

      {next && (
        <Link
          href={next.open ? ROUTES.lesson(next.topic.slug) : ROUTES.lessons(next.lesson)}
          className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-ink no-underline hover:border-navy"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-bold tracking-wide text-muted uppercase">{t("lessons.next")}</span>
            <b className="truncate">{next.topic.name}</b>
          </span>
          {!next.open && <LockIcon size={16} className="text-subtle" />}
          <ArrowRightIcon size={18} className="text-navy-2" />
        </Link>
      )}
    </div>
  );
};
