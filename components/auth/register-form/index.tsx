"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useRegisterMutation } from "@/request/mutation";
import { registerSchema } from "@/schema/auth/auth.schema";
import { SubmitButton } from "../submit-button";

// Ro'yxatdan o'tish → emailga kod (verify bosqichi)
export const RegisterForm = () => {
  const { t } = useTranslation();
  const { values, errors, setField, handleSubmit } = useAppForm(registerSchema, {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const { mutate, isPending } = useRegisterMutation();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("auth.firstName")} htmlFor="reg-first" error={errors.firstName}>
          <TextInput
            id="reg-first"
            autoComplete="given-name"
            autoFocus
            value={values.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            invalid={!!errors.firstName}
          />
        </FormField>
        <FormField label={t("auth.lastName")} htmlFor="reg-last" error={errors.lastName}>
          <TextInput
            id="reg-last"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            invalid={!!errors.lastName}
          />
        </FormField>
      </div>
      <FormField label={t("auth.email")} htmlFor="reg-email" error={errors.email}>
        <TextInput
          id="reg-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ali@gmail.com"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          invalid={!!errors.email}
        />
      </FormField>
      <FormField label={t("auth.password")} htmlFor="reg-password" error={errors.password} hint={t("auth.passwordHint")}>
        <PasswordInput
          id="reg-password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          invalid={!!errors.password}
        />
      </FormField>
      <SubmitButton pending={isPending} pendingText={t("common.sending")}>
        {t("auth.submitRegister")}
      </SubmitButton>
    </form>
  );
};
