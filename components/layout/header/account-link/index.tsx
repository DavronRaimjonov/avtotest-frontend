"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookmarkIcon, CrownIcon, KeyIcon, LogoutIcon, RetryIcon, UserIcon, UsersIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useAccess } from "@/hooks/useAccess";
import { useMeQuery } from "@/hooks/useQuery";
import { GROUP_TESTS_ENABLED } from "@/lib/constants";
import { formatDate, userContact } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useLogoutMutation } from "@/request/mutation";
import { useAuthStore } from "@/store/auth.store";

// Mehmon — "Kirish" (Google oynasi), tizimga kirgan — avatar va menyu
export const AccountLink = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { data: me } = useMeQuery();

  if (!hasSession) {
    return (
      <button
        type="button"
        onClick={() => openLogin()}
        className="btn-hover flex h-10 items-center rounded-[10px] bg-white px-4.5 text-sm font-bold text-navy"
      >
        {t("common.login")}
      </button>
    );
  }

  return (
    <AccountMenu
      name={[me?.firstName, me?.lastName].filter(Boolean).join(" ")}
      contact={userContact(me)}
      avatar={me?.avatarUrl}
      hasPassword={me?.hasPassword ?? true}
    />
  );
};

type MenuProps = { name: string; contact: string; avatar?: string | null; hasPassword: boolean };

const AccountMenu = ({ name, contact, avatar, hasPassword }: MenuProps) => {
  const openLogin = useAuthStore((s) => s.openLogin);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogoutMutation();
  const { access } = useAccess();
  const current = access?.current;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("common.account")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-navy-2 text-sm font-extrabold text-white"
      >
        {avatar ? <Image src={avatar} alt="" fill unoptimized referrerPolicy="no-referrer" className="object-cover" /> : initials}
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-40 flex w-64 animate-fade-in flex-col gap-1 rounded-2xl border border-line bg-white p-2 text-ink shadow-float">
          <Link
            href={ROUTES.profile}
            onClick={() => setOpen(false)}
            className="flex flex-col gap-0.5 rounded-[10px] px-3 py-2 text-ink no-underline hover:bg-bg"
          >
            <b className="truncate text-sm">{name || t("common.user")}</b>
            {contact && <span className="truncate text-[13px] text-muted">{contact}</span>}
          </Link>
          <Link
            href={ROUTES.profile}
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm font-bold text-slate no-underline hover:bg-bg"
          >
            <UserIcon size={18} />
            {t("nav.profile")}
          </Link>
          {/* Mening tarifim: faol bo'lsa nomi va muddati, yo'q bo'lsa "Tarif olish" */}
          <Link
            href={ROUTES.pricing}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-[10px] bg-bg px-3 py-2.5 text-sm text-slate no-underline hover:bg-soft"
          >
            <CrownIcon size={18} className="flex-none text-tint-yellow-fg" />
            <span className="flex min-w-0 flex-col">
              <b className="truncate">{current ? (current.planTitle ?? current.planCode) : t("account.noPlan")}</b>
              <span className="truncate text-xs text-muted">
                {current ? t("account.until", { date: formatDate(current.expiresAt) }) : t("account.getPlan")}
              </span>
            </span>
          </Link>
          {GROUP_TESTS_ENABLED && (
            <Link
              href={ROUTES.groupTests}
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm font-bold text-slate no-underline hover:bg-bg"
            >
              <UsersIcon size={18} />
              {t("groupTest.join.cta")}
            </Link>
          )}
          <Link
            href={ROUTES.saved}
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm font-bold text-slate no-underline hover:bg-bg"
          >
            <BookmarkIcon size={18} />
            {t("more.saved")}
          </Link>
          <Link
            href={ROUTES.mistakes}
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm font-bold text-slate no-underline hover:bg-bg"
          >
            <RetryIcon size={18} />
            {t("more.mistakes")}
          </Link>
          {/* Parolsiz (Telegram orqali kelgan) — "Parol yarating" (POST /auth/set-password) */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openLogin(undefined, hasPassword ? "change" : "setPassword");
            }}
            className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-left text-sm font-bold text-slate hover:bg-bg"
          >
            <KeyIcon size={18} />
            {hasPassword ? t("auth.titles.change") : t("auth.setPassword")}
          </button>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-left text-sm font-bold text-bad-text hover:bg-bad-bg disabled:opacity-60"
          >
            <LogoutIcon size={18} />
            {t("common.logout")}
          </button>
        </div>
      )}
    </div>
  );
};
