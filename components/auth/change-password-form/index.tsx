"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useChangePasswordMutation } from "@/request/mutation";
import { changePasswordSchema } from "@/schema/auth/auth.schema";
import { SubmitButton } from "../submit-button";

export const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const { values, errors, setField, handleSubmit } = useAppForm(changePasswordSchema, {
    currentPassword: "",
    newPassword: "",
  });
  const { mutate, isPending } = useChangePasswordMutation();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4" noValidate>
      <FormField label={t("auth.currentPassword")} htmlFor="cp-current" error={errors.currentPassword}>
        <PasswordInput
          id="cp-current"
          autoComplete="current-password"
          autoFocus
          value={values.currentPassword}
          onChange={(e) => setField("currentPassword", e.target.value)}
          invalid={!!errors.currentPassword}
        />
      </FormField>
      <FormField label={t("auth.newPassword")} htmlFor="cp-new" error={errors.newPassword} hint={t("auth.passwordHint")}>
        <PasswordInput
          id="cp-new"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => setField("newPassword", e.target.value)}
          invalid={!!errors.newPassword}
        />
      </FormField>
      <SubmitButton pending={isPending} pendingText={t("common.sending")}>
        {t("auth.submitChange")}
      </SubmitButton>
    </form>
  );
};
