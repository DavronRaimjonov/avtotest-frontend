"use client";

import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";

type ShellProps = {
  title: string;
  subtitle?: string;
  // O'ng tomonda (ulanish holati)
  aside?: React.ReactNode;
  children: React.ReactNode;
};

// Jamoaviy test sahifasi (lobby, natija, xabarlar) — test ekrani kabi o'z paneli bilan, orqaga — "Jamoaviy test"
export const GroupShell = ({ title, subtitle, aside, children }: ShellProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-17 max-w-310 items-center gap-4 px-4 sm:px-6">
          <Link
            href={ROUTES.groupTests}
            aria-label={t("common.back")}
            className="flex size-11 flex-none items-center justify-center rounded-[10px] border border-line text-navy sm:size-10"
          >
            <ChevronLeftIcon size={18} />
          </Link>
          <div className="flex min-w-0 flex-col">
            <b className="truncate">{title}</b>
            {subtitle && <span className="truncate text-[13px] text-muted">{subtitle}</span>}
          </div>
          {aside && <div className="ml-auto flex-none">{aside}</div>}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-260 flex-1 flex-col gap-6 px-4 pt-8 pb-20 sm:px-6">{children}</main>
    </div>
  );
};

// Real vaqt kanali holati: ulangan — yashil, ulanmoqda — sariq (sahifa baribir serverdan yangilanadi)
export const ConnectionBadge = ({ connected }: { connected: boolean }) => {
  const { t } = useTranslation();
  return (
    <span
      role="status"
      className={cn(
        "flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-bold",
        connected ? "bg-ok-bg text-ok-text" : "bg-warn-bg text-warn-text",
      )}
    >
      <span className={cn("size-2 rounded-full", connected ? "bg-ok" : "animate-pulse bg-warn")} aria-hidden="true" />
      {connected ? t("groupTest.online") : t("groupTest.connecting")}
    </span>
  );
};

type MessageProps = {
  title: string;
  text: string;
  // Asosiy amal (masalan, "Qayta urinish"); "Jamoaviy testlarim" havolasi har doim bor
  children?: React.ReactNode;
};

export const GroupMessage = ({ title, text, children }: MessageProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="m-0 text-xl font-extrabold sm:text-2xl">{title}</h1>
      <p className="m-0 max-w-md text-muted">{text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {children}
        <Link
          href={ROUTES.groupTests}
          className="flex h-12 items-center rounded-xl border-[1.5px] border-navy px-6 font-bold text-navy no-underline"
        >
          {t("groupTest.mine.title")}
        </Link>
      </div>
    </div>
  );
};

export const GroupTestSkeleton = () => (
  <div className="flex min-h-dvh flex-col" aria-busy="true">
    <div className="h-17.25 border-b border-line bg-white" />
    <div className="mx-auto flex w-full max-w-260 flex-col gap-6 px-4 pt-8 sm:px-6">
      <span className="h-90 animate-pulse rounded-[28px] bg-soft" />
      <span className="h-24 animate-pulse rounded-[20px] bg-soft" />
    </div>
  </div>
);
