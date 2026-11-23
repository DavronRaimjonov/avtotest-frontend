"use client";

import { Link } from "@/components/ui/link";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTopicsQuery } from "@/hooks/useQuery";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";

const DOTS = ["bg-accent", "bg-navy-2", "bg-ok", "bg-bad"];

export const Topics = () => {
  const { t } = useTranslation();
  const { data: topics, isPending } = useTopicsQuery();
  const start = useStartAttempt();

  return (
    <section id="topics" className="mx-auto max-w-300 scroll-mt-24 px-6 pt-24">
      <SectionHeading eyebrow={t("topics.eyebrow")} title={t("topics.title")}>
        <Link
          href={ROUTES.variants}
          className="btn-hover flex h-12 items-center gap-2 rounded-xl border-[1.5px] border-navy px-5 font-bold text-navy no-underline"
        >
          {t("topics.all")}
          <ArrowRightIcon size={18} />
        </Link>
      </SectionHeading>
      <div className="flex flex-wrap gap-2.5">
        {isPending
          ? Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="h-11.5 w-44 animate-pulse rounded-full bg-soft" />
            ))
          : topics?.map((topic, i) => {
              // Savol biriktirilmagan mavzu nofaol
              const empty = topic.questionCount === 0;
              return (
                <button
                  key={topic.id}
                  type="button"
                  disabled={empty || start.isPending}
                  title={empty ? t("topics.soon") : t("topics.count", { count: topic.questionCount })}
                  onClick={() => start.start({ source: "topic", topicId: topic.id, mode: "practice" })}
                  className={cn(
                    "inline-flex h-11.5 animate-up items-center gap-2.5 rounded-full border-[1.5px] border-soft bg-soft px-4.5 text-sm font-bold text-ink transition-[transform,border-color,background]",
                    empty ? "cursor-default opacity-55" : "hover:-translate-y-0.75 hover:border-navy hover:bg-white",
                  )}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className={`size-2 rounded-full ${DOTS[i % DOTS.length]}`} />
                  {topic.name}
                  {!empty && <span className="text-xs text-muted">{topic.questionCount}</span>}
                </button>
              );
            })}
      </div>
    </section>
  );
};
