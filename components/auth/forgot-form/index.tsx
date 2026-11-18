"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useForgotPasswordMutation } from "@/request/mutation";
import { forgotSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { SubmitButton } from "../submit-button";

// Parolni tiklash (yoki faqat Google bilan kirganlar uchun parol o'rnatish): emailga kod
export const ForgotForm = () => {
  const { t } = useTranslation();
  const email = useAuthStore((s) => s.email);
  const { values, errors, setField, handleSubmit } = useAppForm(forgotSchema, { email });
  const { mutate, isPending } = useForgotPasswordMutation();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data.email))} className="flex flex-col gap-4" noValidate>
      <p className="m-0 text-[15px] leading-relaxed text-muted">{t("auth.forgotText")}</p>
      <FormField label={t("auth.email")} htmlFor="forgot-email" error={errors.email}>
        <TextInput
          id="forgot-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          invalid={!!errors.email}
        />
      </FormField>
      <SubmitButton pending={isPending} pendingText={t("common.sending")}>
        {t("auth.submitForgot")}
      </SubmitButton>
    </form>
  );
};
