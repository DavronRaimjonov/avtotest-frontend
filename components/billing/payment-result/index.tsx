"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, ClockIcon, XIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { refetchAccess, useAccess } from "@/hooks/useAccess";
import { useOrderQuery } from "@/hooks/useQuery";
import { PAYMENT_POLL_MAX_MS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useStartAttempt } from "@/request/mutation";

// /payment/result?orderId=123 — Click / Payme to'lovdan keyin shu yerga qaytaradi ("Orqaga" ham).
// To'lovni webhook orqali server tasdiqlaydi: "to'landi" faqat status === "paid" bo'lganda
export const PaymentResult = () => {
  const { t } = useTranslation();
  const orderId = Number(useSearchParams().get("orderId"));
  const [startedAt] = useState(() => Date.now());
  const { data: order, isError } = useOrderQuery(orderId, startedAt);
  const { access } = useAccess();
  const { start, isPending: starting } = useStartAttempt();

  // Pending holatda ~60 soniyadan keyin "hali tasdiqlanmadi" matni
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), PAYMENT_POLL_MAX_MS);
    return () => clearTimeout(id);
  }, []);

  const status = order?.status;
  useEffect(() => {
    if (status === "paid") refetchAccess();
  }, [status]);

  if (!orderId || isError) {
    return (
      <Shell tone="bad" icon={<XIcon size={30} strokeWidth={2.6} />} title={t("payment.notFound")} text={t("payment.notFoundText")}>
        <PrimaryLink href={ROUTES.pricing}>{t("paywall.cta")}</PrimaryLink>
      </Shell>
    );
  }

  if (!order || status === "pending") {
    return (
      <Shell
        tone="wait"
        icon={<span className="size-8 animate-spin rounded-full border-[3px] border-navy-2/25 border-t-navy-2" />}
        title={t("payment.checking")}
        text={timedOut ? t("payment.stillPending") : t("payment.checkingText")}
      >
        {timedOut && <SecondaryLink href={ROUTES.home}>{t("payment.home")}</SecondaryLink>}
      </Shell>
    );
  }

  if (status === "paid") {
    const until = access?.current?.expiresAt;
    return (
      <Shell
        tone="ok"
        icon={<CheckIcon size={32} strokeWidth={2.8} />}
        title={t("payment.success")}
        text={until ? t("payment.successText", { plan: order.planTitle, date: formatDate(until) }) : order.planTitle}
      >
        <button
          type="button"
          disabled={starting}
          onClick={() => start({ source: "exam", mode: "exam" })}
          className="btn-hover flex h-12 items-center rounded-xl bg-accent px-6 font-extrabold text-navy disabled:opacity-70"
        >
          {t("payment.startExam")}
        </button>
        <SecondaryLink href={ROUTES.home}>{t("payment.home")}</SecondaryLink>
      </Shell>
    );
  }

  // cancelled / refunded
  return (
    <Shell
      tone={status === "refunded" ? "wait" : "bad"}
      icon={status === "refunded" ? <ClockIcon size={30} /> : <XIcon size={30} strokeWidth={2.6} />}
      title={t(status === "refunded" ? "payment.refunded" : "payment.failed")}
      text={t(status === "refunded" ? "payment.refundedText" : "payment.failedText")}
    >
      <PrimaryLink href={ROUTES.pricing}>{t("payment.retry")}</PrimaryLink>
      <SecondaryLink href={ROUTES.home}>{t("payment.home")}</SecondaryLink>
    </Shell>
  );
};

const TONES = {
  ok: "bg-ok-bg text-ok-text",
  bad: "bg-bad-bg text-bad-text",
  wait: "bg-tint-blue text-navy-2",
};

type ShellProps = {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
};

const Shell = ({ tone, icon, title, text, children }: ShellProps) => (
  <div className="mx-auto flex max-w-140 flex-col items-center gap-5 px-6 py-20 text-center">
    <span className={cn("flex size-18 items-center justify-center rounded-full", TONES[tone])}>{icon}</span>
    <h1 className="m-0 text-[28px] font-extrabold tracking-tight">{title}</h1>
    <p className="m-0 text-[15px] leading-relaxed text-muted" aria-live="polite">
      {text}
    </p>
    {children && <div className="flex flex-wrap justify-center gap-3 pt-2">{children}</div>}
  </div>
);

const PrimaryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="btn-hover flex h-12 items-center rounded-xl bg-accent px-6 font-extrabold text-navy no-underline">
    {children}
  </Link>
);

const SecondaryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="flex h-12 items-center rounded-xl border-[1.5px] border-line bg-white px-6 font-bold text-ink no-underline hover:border-navy"
  >
    {children}
  </Link>
);
