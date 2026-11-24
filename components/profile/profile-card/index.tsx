"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/@types";
import { FormField } from "@/components/ui/form-field";
import { KeyIcon, LogoutIcon, TelegramIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { formatDate, userContact } from "@/lib/helpers";
import { useLogoutMutation, useUnlinkTelegramMutation, useUpdateMeMutation } from "@/request/mutation";
import { profileSchema } from "@/schema/profile/profile.schema";
import { useAuthStore } from "@/store/auth.store";

export const fullName = (me?: Pick<User, "firstName" | "lastName"> | null) =>
  [me?.firstName, me?.lastName].filter(Boolean).join(" ");

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Avatar, ism, telefon, kirish usullari. "Tahrirlash" — ism/familiya (PATCH /me), parol, Telegram ulash/uzish, chiqish
export const ProfileCard = ({ me }: { me: User }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const openLogin = useAuthStore((s) => s.openLogin);
  const telegramOff = useAuthStore((s) => s.telegramOff);
  const logout = useLogoutMutation();
  const unlink = useUnlinkTelegramMutation();
  const name = fullName(me) || t("common.user");

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="relative flex size-18 flex-none items-center justify-center overflow-hidden rounded-full bg-navy-2 text-2xl font-extrabold text-white">
          {me.avatarUrl ? (
            <Image src={me.avatarUrl} alt="" fill unoptimized referrerPolicy="no-referrer" className="object-cover" />
          ) : (
            initialsOf(name)
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="m-0 truncate text-2xl font-extrabold tracking-tight">{name}</h1>
          <span className="truncate text-sm text-muted">{userContact(me)}</span>
          <span className="text-xs text-subtle">{t("profile.since", { date: formatDate(me.createdAt) })}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {me.hasPassword && <Badge>{t("profile.methodPassword")}</Badge>}
        {me.hasTelegram && <Badge>{me.telegramUsername ? `Telegram · @${me.telegramUsername}` : "Telegram"}</Badge>}
      </div>

      {editing ? (
        <EditForm me={me} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-hover h-11 rounded-xl bg-navy text-sm font-bold text-white"
          >
            {t("profile.edit")}
          </button>
          {/* Parolsiz (Telegram orqali kelgan) — "Parol yarating" */}
          <button
            type="button"
            onClick={() => openLogin(undefined, me.hasPassword ? "change" : "setPassword")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-sm font-bold text-slate hover:border-navy"
          >
            <KeyIcon size={16} />
            {me.hasPassword ? t("auth.titles.change") : t("auth.setPassword")}
          </button>
          {/* Telegram: ulash — bot orqali tasdiqlash oynasi; uzish — boshqa kirish usuli bo'lsagina (aks holda server xato beradi) */}
          {me.hasTelegram ? (
            <button
              type="button"
              onClick={() => unlink.mutate()}
              disabled={unlink.isPending}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-sm font-bold text-slate hover:border-navy disabled:opacity-60"
            >
              <TelegramIcon size={16} className="text-[#229ED9]" />
              {t("profile.telegram.unlink")}
            </button>
          ) : (
            !telegramOff && (
              <button
                type="button"
                onClick={() => openLogin(undefined, "telegramLink")}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-sm font-bold text-slate hover:border-navy"
              >
                <TelegramIcon size={16} className="text-[#229ED9]" />
                {t("profile.telegram.link")}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-bad-text hover:bg-bad-bg disabled:opacity-60"
          >
            <LogoutIcon size={16} />
            {t("common.logout")}
          </button>
        </div>
      )}
    </section>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-slate">{children}</span>
);

const EditForm = ({ me, onDone }: { me: User; onDone: () => void }) => {
  const { t } = useTranslation();
  const { values, errors, setField, handleSubmit } = useAppForm(profileSchema, {
    firstName: me.firstName ?? "",
    lastName: me.lastName ?? "",
  });
  const update = useUpdateMeMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => update.mutate(data, { onSuccess: onDone }))}
      className="flex flex-col gap-3"
      noValidate
    >
      <FormField label={t("auth.firstName")} htmlFor="profile-first" error={errors.firstName}>
        <TextInput
          id="profile-first"
          autoComplete="given-name"
          autoFocus
          value={values.firstName}
          onChange={(e) => setField("firstName", e.target.value)}
          invalid={!!errors.firstName}
        />
      </FormField>
      <FormField label={t("auth.lastName")} htmlFor="profile-last" error={errors.lastName}>
        <TextInput
          id="profile-last"
          autoComplete="family-name"
          value={values.lastName}
          onChange={(e) => setField("lastName", e.target.value)}
          invalid={!!errors.lastName}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          disabled={update.isPending}
          className="h-11 rounded-xl border border-line text-sm font-bold text-slate hover:border-navy"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={update.isPending}
          className="btn-hover h-11 rounded-xl bg-accent text-sm font-extrabold text-navy disabled:opacity-60"
        >
          {update.isPending ? t("profile.saving") : t("profile.save")}
        </button>
      </div>
    </form>
  );
};
