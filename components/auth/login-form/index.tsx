"use client";

import { useTranslation } from "react-i18next";
import { TelegramIcon, WarningIcon } from "@/components/ui/icons";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAppForm } from "@/hooks/useAppForm";
import { getErrorCode, toPhone } from "@/lib/helpers";
import { useLoginMutation } from "@/request/mutation";
import { loginSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { SubmitButton } from "../submit-button";

// Telefon + parol (Telegram orqali ro'yxatdan o'tib parol yaratganlar uchun).
// PHONE_NOT_REGISTERED / PASSWORD_NOT_SET — forma ichida izoh va "Telegram orqali" tugmasi
export const LoginForm = () => {
  const { t } = useTranslation();
  const setView = useAuthStore((s) => s.setView);
  const telegramOff = useAuthStore((s) => s.telegramOff);
  const { values, errors, setField, handleSubmit } = useAppForm(loginSchema, { phone: "", password: "" });
  const { mutate, isPending, error, reset } = useLoginMutation();
  const code = getErrorCode(error);
  const notice =
    code === "PHONE_NOT_REGISTERED"
      ? { text: t("auth.phoneNotRegistered"), button: t("auth.registerWithTelegram") }
      : code === "PASSWORD_NOT_SET"
        ? { text: t("auth.passwordNotSet"), button: t("auth.telegram.button") }
        : null;

  return (
    <form
      onSubmit={handleSubmit((data) => mutate({ phone: toPhone(data.phone), password: data.password }))}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormField label={t("auth.phone")} htmlFor="login-phone" error={errors.phone}>
        <PhoneInput
          id="login-phone"
          value={values.phone}
          onChange={(v) => {
            setField("phone", v);
            reset();
          }}
          invalid={!!errors.phone}
        />
      </FormField>
      <FormField label={t("auth.password")} htmlFor="login-password" error={errors.password}>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          invalid={!!errors.password}
        />
      </FormField>
      <button
        type="button"
        onClick={() => setView("forgot", { phone: values.phone.trim() })}
        className="-mt-1 self-end text-[13px] font-bold text-navy-2"
      >
        {t("auth.forgotLink")}
      </button>
      {notice && (
        <div className="flex flex-col gap-3 rounded-xl bg-warn-bg px-3.5 py-3">
          <p className="m-0 flex items-start gap-2 text-sm font-semibold text-warn-text">
            <WarningIcon size={18} className="mt-px flex-none" />
            {notice.text}
          </p>
          {!telegramOff && (
            <button
              type="button"
              onClick={() => setView("telegram")}
              className="btn-hover flex h-11 items-center justify-center gap-2 rounded-xl bg-[#229ED9] text-sm font-extrabold text-white"
            >
              <TelegramIcon size={18} />
              {notice.button}
            </button>
          )}
        </div>
      )}
      <SubmitButton pending={isPending} pendingText={t("auth.loggingIn")}>
        {t("auth.submitLogin")}
      </SubmitButton>
    </form>
  );
};
