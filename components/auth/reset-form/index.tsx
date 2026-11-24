"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { OTP_LENGTH } from "@/lib/constants";
import { formatPhone, toPhone } from "@/lib/helpers";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/request/mutation";
import { resetSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { ResendCode } from "../resend-code";
import { SubmitButton } from "../submit-button";

// Telegram botga kelgan kod + yangi parol → tizimga kiradi (boshqa qurilmalar chiqariladi)
export const ResetForm = () => {
  const { t } = useTranslation();
  const phone = useAuthStore((s) => s.phone);
  const { values, errors, setField, handleSubmit } = useAppForm(resetSchema, { code: "", newPassword: "" });
  const reset = useResetPasswordMutation();
  const resend = useForgotPasswordMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => reset.mutate({ phone: toPhone(phone), ...data }))}
      className="flex flex-col gap-4"
      noValidate
    >
      <p className="m-0 text-[15px] leading-relaxed text-muted">
        {t("auth.resetText", { phone: formatPhone(toPhone(phone)) })}
      </p>
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
      <ResendCode onResend={() => resend.mutate(phone)} pending={resend.isPending} />
    </form>
  );
};

// Faqat raqam, OTP_LENGTH ta. Telefonda kodni avtomatik taklif qiladi
const CodeInput = ({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
}) => (
  <TextInput
    id={id}
    inputMode="numeric"
    autoComplete="one-time-code"
    autoFocus
    maxLength={OTP_LENGTH}
    placeholder={"•".repeat(OTP_LENGTH)}
    value={value}
    onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
    invalid={invalid}
    className="h-14 text-center text-2xl font-extrabold tracking-[0.5em]"
  />
);
