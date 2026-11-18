"use client";

import { useTranslation } from "react-i18next";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useLoginMutation } from "@/request/mutation";
import { loginSchema } from "@/schema/auth/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { SubmitButton } from "../submit-button";

export const LoginForm = () => {
  const { t } = useTranslation();
  const setView = useAuthStore((s) => s.setView);
  const { values, errors, setField, handleSubmit } = useAppForm(loginSchema, { email: "", password: "" });
  const { mutate, isPending } = useLoginMutation();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4" noValidate>
      <FormField label={t("auth.email")} htmlFor="login-email" error={errors.email}>
        <TextInput
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ali@gmail.com"
          autoFocus
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          invalid={!!errors.email}
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
        onClick={() => setView("forgot", { email: values.email.trim() })}
        className="-mt-1 self-end text-[13px] font-bold text-navy-2"
      >
        {t("auth.forgotLink")}
      </button>
      <SubmitButton pending={isPending} pendingText={t("auth.loggingIn")}>
        {t("auth.submitLogin")}
      </SubmitButton>
    </form>
  );
};
