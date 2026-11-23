"use client";

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";
import { useGoogleLoginMutation } from "@/request/mutation";
import { type AuthView, useAuthStore } from "@/store/auth.store";
import { ChangePasswordForm } from "../change-password-form";
import { ForgotForm } from "../forgot-form";
import { GoogleButton } from "../google-button";
import { LoginForm } from "../login-form";
import { RegisterForm } from "../register-form";
import { ResetForm } from "../reset-form";
import { VerifyForm } from "../verify-form";

const FORMS: Record<AuthView, () => React.ReactNode> = {
  login: LoginForm,
  register: RegisterForm,
  verify: VerifyForm,
  forgot: ForgotForm,
  reset: ResetForm,
  change: ChangePasswordForm,
};

// Orqaga tugmasi qayerga qaytaradi (login/register/change da tugma yo'q)
const BACK: Partial<Record<AuthView, AuthView>> = { verify: "register", forgot: "login", reset: "forgot" };

// Alohida login sahifasi yo'q: "Kirish", "Saqlash", "Xatolar ustida ishlash" va h.k. bosilganda shu oyna ochiladi.
// Email + parol (ro'yxatdan o'tishda emailga kod) yoki Google
export const LoginModal = () => {
  const { t } = useTranslation();
  const open = useAuthStore((s) => s.loginOpen);
  const view = useAuthStore((s) => s.view);
  const setView = useAuthStore((s) => s.setView);
  const close = useAuthStore((s) => s.closeLogin);
  const google = useGoogleLoginMutation();
  const { mutate } = google;
  const onGoogle = useCallback((idToken: string) => mutate({ idToken }), [mutate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const Form = FORMS[view];
  const tabs = view === "login" || view === "register";
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

        {tabs && (
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-bg p-1" role="tablist">
            {(["login", "register"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "h-10 rounded-[9px] text-sm font-bold",
                  view === v ? "bg-white text-navy shadow-sm" : "text-slate",
                )}
              >
                {t(`auth.tabs.${v}`)}
              </button>
            ))}
          </div>
        )}

        <Form key={view} />

        {/* Google — qo'shimcha usul: kirish ham, ro'yxatdan o'tish ham (akkaunt bo'lmasa yaratiladi) */}
        {tabs && (
          <>
            <div className="flex items-center gap-3 text-[13px] font-semibold text-muted">
              <span className="h-px flex-1 bg-line" />
              {t("auth.or")}
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="flex justify-center">
              {google.isPending ? (
                <span className="flex h-11 items-center text-sm font-bold text-muted">{t("auth.loggingIn")}</span>
              ) : (
                <GoogleButton onSuccess={onGoogle} intent={view === "register" ? "signup" : "signin"} width={340} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
