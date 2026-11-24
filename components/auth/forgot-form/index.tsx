"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useForgotPasswordMutation } from "@/request/mutation";
import { forgotSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { SubmitButton } from "../submit-button";

// Parolni tiklash: telefon raqami → kod Telegram botga keladi
export const ForgotForm = () => {
  const { t } = useTranslation();
  const phone = useAuthStore((s) => s.phone);
  const { values, errors, setField, handleSubmit } = useAppForm(forgotSchema, { phone });
  const { mutate, isPending } = useForgotPasswordMutation();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data.phone))} className="flex flex-col gap-4" noValidate>
      <p className="m-0 text-[15px] leading-relaxed text-muted">{t("auth.forgotText")}</p>
      <FormField label={t("auth.phone")} htmlFor="forgot-phone" error={errors.phone}>
        <PhoneInput
          id="forgot-phone"
          autoFocus
          value={values.phone}
          onChange={(v) => setField("phone", v)}
          invalid={!!errors.phone}
        />
      </FormField>
      <SubmitButton pending={isPending} pendingText={t("common.sending")}>
        {t("auth.submitForgot")}
      </SubmitButton>
    </form>
  );
};
