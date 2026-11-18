"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { OTP_LENGTH } from "@/lib/constants";
import { useResendCodeMutation, useVerifyEmailMutation } from "@/request/mutation";
import { verifySchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { ResendCode } from "../resend-code";
import { SubmitButton } from "../submit-button";

// Emailga kelgan 6 xonali kod → tizimga kiradi
export const VerifyForm = () => {
  const { t } = useTranslation();
  const email = useAuthStore((s) => s.email);
  const { values, errors, setField, handleSubmit } = useAppForm(verifySchema, { code: "" });
  const verify = useVerifyEmailMutation();
  const resend = useResendCodeMutation();

  return (
    <form
      onSubmit={handleSubmit(({ code }) => verify.mutate({ email, code }))}
      className="flex flex-col gap-4"
      noValidate
    >
      <p className="m-0 text-[15px] leading-relaxed text-muted">{t("auth.verifyText", { email })}</p>
      <FormField label={t("auth.code")} htmlFor="verify-code" error={errors.code}>
        <CodeInput id="verify-code" value={values.code} onChange={(v) => setField("code", v)} invalid={!!errors.code} />
      </FormField>
      <SubmitButton pending={verify.isPending} pendingText={t("common.sending")}>
        {t("auth.submitVerify")}
      </SubmitButton>
      <ResendCode onResend={() => resend.mutate(email)} pending={resend.isPending} />
    </form>
  );
};

// Faqat raqam, OTP_LENGTH ta. Telefonda SMS/email kodini avtomatik taklif qiladi
export const CodeInput = ({
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
