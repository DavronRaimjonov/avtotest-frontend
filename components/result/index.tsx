"use client";

import { Link } from "@/components/ui/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { ResultData } from "@/@types";
import { attemptTitle } from "@/components/test/test-header";
import { useAttemptResultQuery } from "@/hooks/useQuery";
import { GUEST_ID } from "@/lib/constants";
import { getErrorCode } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { useGuestHydrated, useGuestStore } from "@/store/guest.store";
import { ResultReview } from "./review";
import { ResultStats } from "./stats";
import { ResultSummary } from "./summary";

// /result/guest — mehmon natijasi (sessionStorage), /result/<uuid> — serverdan
export const Result = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  return attemptId === GUEST_ID ? <GuestResult /> : <ServerResult id={attemptId} />;
};

const ServerResult = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const { data: result, isPending, isError, error } = useAttemptResultQuery(id);

  if (isPending) return <ResultSkeleton />;

  if (isError) {
    // Test hali tugamagan bo'lsa — davom ettirishga
    const unfinished = getErrorCode(error) === "ATTEMPT_NOT_FINISHED";
    return unfinished ? (
      <ResultMessage
        title={t("result.unfinished")}
        text={t("result.unfinishedText")}
        href={ROUTES.test(id)}
        action={t("result.continue")}
      />
    ) : (
      <ResultMessage title={t("result.notFound")} text={t("result.notFoundText")} />
    );
  }

  return <ResultView result={result} />;
};

const GuestResult = () => {
  const { t } = useTranslation();
  const hydrated = useGuestHydrated();
  const result = useGuestStore((s) => s.result);

  if (!hydrated) return <ResultSkeleton />;
  if (!result) return <ResultMessage title={t("result.notFound")} text={t("result.guestNotFoundText")} />;
  return <ResultView result={result} />;
};

const ResultView = ({ result }: { result: ResultData }) => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-6 pt-10 pb-20">
      <span className="text-sm font-semibold text-muted">
        {t("result.label", {
          title: attemptTitle(t, result),
          mode: t(result.mode === "exam" ? "result.modeExam" : "result.modePractice"),
        })}
      </span>
      {result.guest && <GuestBanner />}
      <ResultSummary result={result} />
      <ResultStats result={result} />
      <ResultReview result={result} />
    </div>
  );
};

// Mehmon natijasi saqlanmaydi — kirishga taklif
const GuestBanner = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  if (hasSession) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-warn bg-warn-bg px-6 py-5">
      <div className="flex flex-[1_1_320px] flex-col gap-1">
        <b className="text-warn-text">{t("result.guestTitle")}</b>
        <span className="text-sm leading-normal text-slate">{t("result.guestText")}</span>
      </div>
      <button
        type="button"
        onClick={() => openLogin()}
        className="btn-hover h-12 rounded-xl bg-navy px-5 text-sm font-bold text-white"
      >
        {t("result.guestLogin")}
      </button>
    </div>
  );
};

type MessageProps = { title: string; text: string; href?: string; action?: string };

const ResultMessage = ({ title, text, href = ROUTES.variants, action }: MessageProps) => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-[1040px] flex-col items-start gap-4 px-6 py-20">
      <h1 className="m-0 text-3xl font-extrabold">{title}</h1>
      <p className="m-0 text-muted">{text}</p>
      <Link
        href={href}
        className="flex h-12 items-center rounded-xl bg-accent px-6 font-extrabold text-navy no-underline"
      >
        {action ?? t("result.backToVariants")}
      </Link>
    </div>
  );
};

export const ResultSkeleton = () => (
  <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-6 pt-10 pb-20">
    <span className="h-[272px] animate-pulse rounded-[28px] bg-soft" />
    <span className="h-24 animate-pulse rounded-[20px] bg-soft" />
    <span className="h-80 animate-pulse rounded-[28px] bg-soft" />
  </div>
);
