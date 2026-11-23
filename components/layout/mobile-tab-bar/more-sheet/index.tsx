"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StartAttemptBody } from "@/@types";
import {
  BookIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  KeyIcon,
  LogoutIcon,
  RetryIcon,
  UsersIcon,
  WarningIcon,
  XIcon,
} from "@/components/ui/icons";
import { useLang } from "@/hooks/useLang";
import { useMeQuery } from "@/hooks/useQuery";
import { useRouter } from "@/hooks/useRouter";
import { TEST_LANGS } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useLogoutMutation, useStartAttempt } from "@/request/mutation";
import { useAuthStore } from "@/store/auth.store";

// iOS "Boshqa bo'limlar" oynasi: pastdan chiqadigan sheet, guruhlangan qatorlar (rangli ikonka, nom, izoh, ›).
// Tab bar'ga sig'maydigan hamma narsa shu yerda: profil / kirish, til, bo'limlar, akkaunt amallari
export const MoreSheet = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { data: me } = useMeQuery();
  const logout = useLogoutMutation();
  const { start, isPending } = useStartAttempt();
  const [langOpen, setLangOpen] = useState(false);

  const name = [me?.firstName, me?.lastName].filter(Boolean).join(" ") || t("common.user");
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const langLabel = TEST_LANGS.find((l) => l.value === lang)?.label;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Orqadagi sahifa aylanmasin
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const then = (action: () => void) => () => {
    onClose();
    action();
  };
  const startTest = (body: StartAttemptBody) => then(() => start(body));
  // Faqat kirganlarga ochiq sahifa: mehmonga login oynasi, kirgach o'sha sahifaga
  const goAuth = (href: string) => then(() => (hasSession ? router.push(href) : openLogin(() => router.push(href))));

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] animate-sheet-up flex-col rounded-t-[28px] bg-[#F2F2F7] [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif]"
      >
        <span className="mx-auto mt-2 h-[5px] w-9 flex-none rounded-full bg-black/15" aria-hidden="true" />
        <div className="flex flex-none items-center justify-between px-4 pt-3 pb-2">
          <h2 id="more-title" className="m-0 text-[22px] font-bold tracking-tight text-black">
            {t("more.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex size-[30px] items-center justify-center rounded-full bg-black/[0.07] text-[#3C3C43]/70"
          >
            <XIcon size={16} strokeWidth={2.6} />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">
          {/* Profil / kirish */}
          <Group>
            {hasSession ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="relative flex size-[52px] flex-none items-center justify-center overflow-hidden rounded-full bg-navy-2 text-lg font-bold text-white">
                  {me?.avatarUrl ? (
                    <Image src={me.avatarUrl} alt="" fill unoptimized referrerPolicy="no-referrer" className="object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <b className="truncate text-[17px] font-semibold text-black">{name}</b>
                  {me?.email && <span className="truncate text-[13px] text-[#8E8E93]">{me.email}</span>}
                </span>
              </div>
            ) : (
              <Row
                icon={<span className="text-lg font-bold">?</span>}
                tone="bg-navy-2"
                title={t("more.loginTitle")}
                text={t("more.loginText")}
                onClick={then(() => openLogin())}
                big
              />
            )}
          </Group>

          {/* Til — ochiladigan ro'yxat */}
          <Group>
            <Row
              icon={<GlobeIcon size={18} />}
              tone="bg-[#8E8E93]"
              title={t("more.lang")}
              text={langLabel}
              onClick={() => setLangOpen((v) => !v)}
              expanded={langOpen}
            />
            {langOpen &&
              TEST_LANGS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={then(() => setLang(l.value))}
                  className="flex h-11 w-full items-center justify-between border-t border-black/[0.08] pr-4 pl-[60px] text-left text-[17px] text-black active:bg-black/5"
                >
                  {l.label}
                  {l.value === lang && <CheckIcon size={18} strokeWidth={2.6} className="text-[#007AFF]" />}
                </button>
              ))}
          </Group>

          {/* Bo'limlar */}
          <Section title={t("more.sections")}>
            {/* Jamoaviy test: mehmonga sahifaning o'zi kirish taklifini ko'rsatadi */}
            <Row
              icon={<UsersIcon size={18} />}
              tone="bg-navy-2"
              title={t("groupTest.join.cta")}
              text={t("more.groupTestText")}
              onClick={then(() => router.push(ROUTES.groupTests))}
            />
            <Row
              icon={<BookIcon size={18} />}
              tone="bg-[#34C759]"
              title={t("modes.topics.title")}
              text={t("modes.topics.text")}
              onClick={then(() => router.push("/#topics"))}
            />
            <Row
              icon={<ClockIcon size={18} />}
              tone="bg-[#FF9500]"
              title={t("modes.exam.title")}
              text={t("modes.exam.text")}
              onClick={startTest({ source: "exam", mode: "exam" })}
              disabled={isPending}
            />
            <Row
              icon={<WarningIcon size={18} />}
              tone="bg-[#FF3B30]"
              title={t("modes.hard.title")}
              text={t("modes.hard.text")}
              onClick={startTest({ source: "hard", mode: "practice" })}
              disabled={isPending}
            />
            <Row
              icon={<RetryIcon size={18} />}
              tone="bg-[#AF52DE]"
              title={t("modes.mistakes.title")}
              text={t("modes.mistakes.text")}
              onClick={goAuth(ROUTES.mistakes)}
            />
          </Section>

          {/* Akkaunt */}
          {hasSession && (
            <Section title={t("more.account")}>
              <Row
                icon={<BookmarkIcon size={18} />}
                tone="bg-[#FF9500]"
                title={t("more.saved")}
                text={t("more.savedText")}
                onClick={goAuth(ROUTES.saved)}
              />
              <Row
                icon={<RetryIcon size={18} />}
                tone="bg-[#FF3B30]"
                title={t("more.mistakes")}
                text={t("more.mistakesText")}
                onClick={goAuth(ROUTES.mistakes)}
              />
              <Row
                icon={<KeyIcon size={18} />}
                tone="bg-[#007AFF]"
                title={me?.hasPassword === false ? t("auth.setPassword") : t("auth.titles.change")}
                onClick={then(() => openLogin(undefined, me?.hasPassword === false ? "forgot" : "change", me?.email))}
              />
              <button
                type="button"
                disabled={logout.isPending}
                onClick={() => logout.mutate(undefined, { onSettled: onClose })}
                className="flex h-12 w-full items-center gap-3 border-t border-black/[0.08] px-4 text-left text-[17px] text-[#FF3B30] active:bg-black/5 disabled:opacity-50"
              >
                <span className="flex size-[30px] items-center justify-center rounded-[7px] bg-[#FF3B30] text-white">
                  <LogoutIcon size={18} />
                </span>
                {t("common.logout")}
              </button>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

const Group = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-none overflow-hidden rounded-[14px] bg-white">{children}</div>
);

// Bloklar flex-none: aylantiriladigan konteynerda siqilib qolmasin
// iOS "inset grouped" bo'lim: kichik kulrang sarlavha + oq blok
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-none flex-col gap-1.5">
    <h3 className="m-0 px-4 text-[13px] font-normal tracking-wide text-[#8E8E93] uppercase">{title}</h3>
    <div className="overflow-hidden rounded-[14px] bg-white [&>*+*]:border-t [&>*+*]:border-black/[0.08]">
      {children}
    </div>
  </section>
);

type RowProps = {
  icon: React.ReactNode;
  tone: string;
  title: string;
  text?: string;
  onClick: () => void;
  disabled?: boolean;
  expanded?: boolean;
  big?: boolean;
};

const Row = ({ icon, tone, title, text, onClick, disabled, expanded, big }: RowProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-expanded={expanded}
    className={cn(
      "flex w-full items-center gap-3 px-4 text-left active:bg-black/5 disabled:opacity-50",
      big ? "min-h-[76px] py-3" : "min-h-[58px] py-2.5",
    )}
  >
    <span
      className={cn(
        "flex flex-none items-center justify-center text-white",
        big ? "size-[52px] rounded-full" : "size-[30px] rounded-[7px]",
        tone,
      )}
    >
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-[17px] text-black">{title}</span>
      {text && <span className="truncate text-[13px] leading-snug text-[#8E8E93]">{text}</span>}
    </span>
    <ChevronRightIcon
      size={16}
      strokeWidth={2.4}
      className={cn("flex-none text-[#C4C4C7] transition-transform", expanded && "rotate-90")}
    />
  </button>
);
