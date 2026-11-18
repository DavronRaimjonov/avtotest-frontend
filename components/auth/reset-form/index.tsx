"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/request/mutation";
import { resetSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { ResendCode } from "../resend-code";
import { SubmitButton } from "../submit-button";
import { CodeInput } from "../verify-form";

// Kod + yangi parol → tizimga kiradi (boshqa qurilmalar chiqariladi)
export const ResetForm = () => {
  const { t } = useTranslation();
  const email = useAuthStore((s) => s.email);
  const { values, errors, setField, handleSubmit } = useAppForm(resetSchema, { code: "", newPassword: "" });
  const reset = useResetPasswordMutation();
  const resend = useForgotPasswordMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => reset.mutate({ email, ...data }))}
      className="flex flex-col gap-4"
      noValidate
    >
      <p className="m-0 text-[15px] leading-relaxed text-muted">{t("auth.resetText", { email })}</p>
      <FormField label={t("auth.code")} htmlFor="reset-code" error={errors.code}>
        <CodeInput id="reset-code" value={values.code} onChange={(v) => setField("code", v)} invalid={!!errors.code} />
      </FormField>
      <FormField
        label={t("auth.newPassword")}
        htmlFor="reset-password"
        error={errors.newPassword}
        hint={t("auth.passwordHint")}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => setField("newPassword", e.target.value)}
          invalid={!!errors.newPassword}
        />
      </FormField>
      <SubmitButton pending={reset.isPending} pendingText={t("common.sending")}>
        {t("auth.submitReset")}
      </SubmitButton>
      <ResendCode onResend={() => resend.mutate(email)} pending={resend.isPending} />
    </form>
  );
};
