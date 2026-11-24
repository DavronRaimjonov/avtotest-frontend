"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useSetPasswordMutation, useTelegramCompleteMutation } from "@/request/mutation";
import { setPasswordSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { SubmitButton } from "../submit-button";

// "Parol yarating" (parol + takrorlash). Ikki holat:
// - telegramPending bor — Telegram orqali ro'yxatdan o'tish: majburiy, "Keyinroq" yo'q → telegram/complete (tokenlar shu yerda)
// - yo'q — kirgan, lekin paroli yo'q eski akkaunt: set-password, "Keyinroq" bilan
export const SetPasswordForm = () => {
  const { t } = useTranslation();
  const finishLogin = useAuthStore((s) => s.finishLogin);
  const pending = useAuthStore((s) => s.telegramPending);
  const { values, errors, setField, handleSubmit } = useAppForm(setPasswordSchema, { password: "", repeat: "" });
  const setPassword = useSetPasswordMutation();
  const complete = useTelegramCompleteMutation();
  const isPending = setPassword.isPending || complete.isPending;
  const name = pending?.firstName?.trim();

  const submit = handleSubmit(({ password }) => {
    if (pending) complete.mutate({ token: pending.token, password });
    else setPassword.mutate(password);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <p className="m-0 text-[15px] leading-relaxed text-muted">
        {name && <b className="text-ink">{t("auth.createPassword.hello", { name })} </b>}
        {t("auth.createPassword.hint")}
      </p>
      <FormField label={t("auth.newPassword")} htmlFor="set-password" error={errors.password} hint={t("auth.passwordHint")}>
        <PasswordInput
          id="set-password"
          autoComplete="new-password"
          autoFocus
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          invalid={!!errors.password}
        />
      </FormField>
      <FormField label={t("auth.createPassword.repeat")} htmlFor="set-password-repeat" error={errors.repeat}>
        <PasswordInput
          id="set-password-repeat"
          autoComplete="new-password"
          value={values.repeat}
          onChange={(e) => setField("repeat", e.target.value)}
          invalid={!!errors.repeat}
        />
      </FormField>
      <SubmitButton pending={isPending} pendingText={t("common.sending")}>
        {t("auth.submitReset")}
      </SubmitButton>
      {!pending && (
        <button
          type="button"
          onClick={finishLogin}
          disabled={isPending}
          className="-mt-1 h-10 rounded-xl text-sm font-bold text-muted hover:bg-bg"
        >
          {t("auth.createPassword.later")}
        </button>
      )}
    </form>
  );
};
