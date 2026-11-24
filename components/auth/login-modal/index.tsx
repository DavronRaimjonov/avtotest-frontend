"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, TelegramIcon, WarningIcon, XIcon } from "@/components/ui/icons";
import { type AuthView, useAuthStore } from "@/store/auth.store";
import { ChangePasswordForm } from "../change-password-form";
import { ForgotForm } from "../forgot-form";
import { LoginForm } from "../login-form";
import { ResetForm } from "../reset-form";
import { SetPasswordForm } from "../set-password-form";
import { TelegramView } from "../telegram-view";

const FORMS: Record<AuthView, () => React.ReactNode> = {
  login: LoginForm,
  forgot: ForgotForm,
  reset: ResetForm,
  change: ChangePasswordForm,
  telegram: () => <TelegramView purpose="login" />,
  telegramLink: () => <TelegramView purpose="link" />,
  setPassword: SetPasswordForm,
};

// Orqaga tugmasi qayerga qaytaradi (login/change da tugma yo'q)
const BACK: Partial<Record<AuthView, AuthView>> = { forgot: "login", reset: "forgot", telegram: "login" };

// Alohida login sahifasi yo'q: "Kirish", "Saqlash", "Xatolar ustida ishlash" va h.k. bosilganda shu oyna ochiladi.
// Tepada "Telegram orqali kirish" (birinchi kirishda akkaunt o'zi yaratiladi), pastda telefon + parol
export const LoginModal = () => {
  const { t } = useTranslation();
  const open = useAuthStore((s) => s.loginOpen);
  const view = useAuthStore((s) => s.view);
  const setView = useAuthStore((s) => s.setView);
  const closeLogin = useAuthStore((s) => s.closeLogin);
  const finishLogin = useAuthStore((s) => s.finishLogin);
  const telegramOff = useAuthStore((s) => s.telegramOff);
  const telegramPending = useAuthStore((s) => s.telegramPending);

  // Zaxira set-password'da foydalanuvchi allaqachon kirgan: yopilsa ham kirishdan oldingi amal bajariladi.
  // Ro'yxatdan o'tishdagi "Parol yarating" (telegramPending) yopilsa — kirmagan bo'lib qoladi (akkaunt saqlanadi)
  const close = view === "setPassword" && !telegramPending ? finishLogin : closeLogin;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const Form = FORMS[view];
  const isLogin = view === "login";
  const back = BACK[view];

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center overflow-y-auto bg-navy/60 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto flex w-full max-w-105 flex-col gap-5 rounded-3xl bg-white p-6 text-ink shadow-float sm:p-7"
      >
        <div className="flex items-center gap-2 pr-10">
          {back && (
            <button
              type="button"
              onClick={() => setView(back)}
              aria-label={t("common.back")}
              className="-ml-2 flex size-9 items-center justify-center rounded-[10px] text-navy hover:bg-bg"
            >
              <ChevronLeftIcon size={18} />
            </button>
          )}
          <h2 id="auth-title" className="m-0 text-2xl font-extrabold tracking-tight">
            {t(`auth.titles.${view}`)}
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t("common.close")}
          className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg"
        >
          <XIcon size={18} />
        </button>

        {/* Telegram — asosiy usul: kirish ham, ro'yxatdan o'tish ham (akkaunt bo'lmasa yaratiladi).
            Bot sozlanmagan bo'lsa — ogohlantirish (telefon + parol baribir ishlaydi) */}
        {isLogin &&
          (telegramOff ? (
            <p className="m-0 flex items-start gap-2 rounded-xl bg-warn-bg px-3.5 py-3 text-sm font-semibold text-warn-text">
              <WarningIcon size={18} className="mt-px flex-none" />
              {t("auth.telegram.off")}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setView("telegram")}
              className="btn-hover flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] text-[15px] font-extrabold text-white"
            >
              <TelegramIcon size={20} />
              {t("auth.telegram.button")}
            </button>
          ))}
        {isLogin && <Divider text={t("auth.phoneDivider")} />}

        <Form key={view} />
      </div>
    </div>
  );
};

const Divider = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-[13px] font-semibold text-muted">
    <span className="h-px flex-1 bg-line" />
    {text}
    <span className="h-px flex-1 bg-line" />
  </div>
);
