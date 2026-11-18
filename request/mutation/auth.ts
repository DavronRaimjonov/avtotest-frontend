"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type {
  ApiError,
  AuthResponse,
  ChangePasswordBody,
  GoogleLoginBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import { useRouter } from "@/hooks/useRouter";
import i18next, { currentLang } from "@/i18n";
import { getErrorCode } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { isProtectedPath, ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { forgotPassword, googleLogin, login, register, resendCode, resetPassword, verifyEmail } from "../auth";
import { clearAuthTokens, hasAuthTokens, saveAuthTokens } from "../token";
import { changePassword, logout, updateMe } from "../user";

const RESEND_SEC = 60;

const errorParams = (error: unknown) =>
  isAxiosError<ApiError>(error) ? (error.response?.data?.params ?? {}) : {};

// Har qanday kirish usuli (login, verify-email, reset-password, google) bir xil yakunlanadi:
// tokenlar saqlanadi, oyna yopiladi, kirishdan oldin so'ralgan amal (afterLogin) bajariladi
const useAuthSuccess = () => {
  const queryClient = useQueryClient();
  return ({ access_token, refresh_token, user, isNew }: AuthResponse) => {
    saveAuthTokens({ access_token, refresh_token });
    queryClient.setQueryData(QUERY_KEYS.me, user);
    notify(isNew ? i18next.t("auth.welcome", { name: user.firstName ?? "" }) : i18next.t("auth.loggedIn"));
    // Saytda tanlangan til profilga yoziladi — keyingi testlar shu tilda
    const lang = currentLang();
    if (user.lang !== lang) {
      updateMe({ lang })
        .then((me) => queryClient.setQueryData(QUERY_KEYS.me, me))
        .catch(() => undefined);
    }
    const { afterLogin, closeLogin } = useAuthStore.getState();
    closeLogin();
    afterLogin?.();
  };
};

// EMAIL_NOT_VERIFIED — parol to'g'ri, server kodni qayta yubordi: kod oynasi ochiladi
export const useLoginMutation = () =>
  useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: useAuthSuccess(),
    onError: (error, { email }) => {
      if (getErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        const sec = Number(errorParams(error).resendInSec ?? RESEND_SEC);
        useAuthStore.getState().setView("verify", { email, resendInSec: sec });
        notify(i18next.t("auth.notVerified"), "info");
        return;
      }
      // INVALID_CREDENTIALS, ACCOUNT_BLOCKED, TOO_MANY_REQUESTS
      notifyApiError(error);
    },
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (body: RegisterBody) => register({ ...body, lang: currentLang() }),
    onSuccess: (res, { email }) =>
      useAuthStore.getState().setView("verify", { email: res.email ?? email, resendInSec: res.resendInSec ?? RESEND_SEC }),
    // EMAIL_TAKEN, MAIL_SEND_FAILED, VALIDATION_ERROR
    onError: notifyApiError,
  });

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationKey: ["auth", "verify-email"],
    mutationFn: (body: VerifyEmailBody) => verifyEmail(body),
    onSuccess: useAuthSuccess(),
    // INVALID_OTP, OTP_ATTEMPTS_EXHAUSTED
    onError: notifyApiError,
  });

export const useResendCodeMutation = () =>
  useMutation({
    mutationKey: ["auth", "resend-code"],
    mutationFn: (email: string) => resendCode(email),
    onSuccess: (res) => {
      useAuthStore.getState().setResendIn(res.resendInSec ?? RESEND_SEC);
      notify(i18next.t("auth.codeSent"), "info");
    },
    onError: (error) => {
      // OTP_TOO_SOON — tugmadagi teskari sanoq serverdagi qiymatga tenglashtiriladi
      if (getErrorCode(error) === "OTP_TOO_SOON") {
        useAuthStore.getState().setResendIn(Number(errorParams(error).seconds ?? RESEND_SEC));
      }
      notifyApiError(error);
    },
  });

// Javob har doim bir xil (email bor-yo'qligi oshkor qilinmaydi)
export const useForgotPasswordMutation = () =>
  useMutation({
    mutationKey: ["auth", "forgot-password"],
    mutationFn: (email: string) => forgotPassword({ email, lang: currentLang() }),
    onSuccess: (_res, email) => {
      useAuthStore.getState().setView("reset", { email, resendInSec: RESEND_SEC });
      notify(i18next.t("auth.forgotSent"), "info");
    },
    onError: notifyApiError,
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationKey: ["auth", "reset-password"],
    mutationFn: (body: ResetPasswordBody) => resetPassword(body),
    onSuccess: useAuthSuccess(),
    // INVALID_OTP, OTP_ATTEMPTS_EXHAUSTED
    onError: notifyApiError,
  });

// Google: shu email bilan akkaunt bo'lsa unga ulanadi
export const useGoogleLoginMutation = () =>
  useMutation({
    mutationKey: ["auth", "google"],
    mutationFn: (body: GoogleLoginBody) => googleLogin(body),
    onSuccess: useAuthSuccess(),
    // INVALID_GOOGLE_TOKEN, GOOGLE_AUTH_DISABLED, ACCOUNT_BLOCKED
    onError: notifyApiError,
  });

// Yangi tokenlar saqlanadi (boshqa qurilmalar chiqariladi)
export const useChangePasswordMutation = () =>
  useMutation({
    mutationKey: ["auth", "change-password"],
    mutationFn: (body: ChangePasswordBody) => changePassword(body),
    onSuccess: (tokens) => {
      saveAuthTokens(tokens);
      notify(i18next.t("auth.passwordChanged"));
      useAuthStore.getState().closeLogin();
    },
    // INVALID_CURRENT_PASSWORD, VALIDATION_ERROR
    onError: notifyApiError,
  });

// Backend xato bersa ham foydalanuvchi baribir chiqariladi
export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      if (hasAuthTokens()) await logout().catch(() => undefined);
    },
    onSettled: () => {
      clearAuthTokens();
      queryClient.removeQueries({ queryKey: QUERY_KEYS.me });
      queryClient.removeQueries({ queryKey: ["attempts"] });
      if (isProtectedPath(window.location.pathname)) router.replace(ROUTES.home);
    },
  });
};
