"use client";

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, ChangePasswordBody, LoginBody, ResetPasswordBody } from "@/@types";
import { notify, notifyApiError } from "@/generics/notification";
import { useRouter } from "@/hooks/useRouter";
import i18next, { currentLang } from "@/i18n";
import { getErrorCode, toPhone } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { isProtectedPath, ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/auth.store";
import { forgotPassword, login, resetPassword, telegramComplete } from "../auth";
import { clearAuthTokens, hasAuthTokens, saveAuthTokens } from "../token";
import { changePassword, logout, setPassword, updateMe } from "../user";

const RESEND_SEC = 60;

// Har qanday kirish usuli (telegram, telefon + parol, reset-password) bir xil yakunlanadi:
// tokenlar saqlanadi, oyna yopiladi, kirishdan oldin so'ralgan amal (afterLogin) bajariladi
export const completeAuth = (queryClient: QueryClient, { access_token, refresh_token, user, isNew }: AuthResponse) => {
  saveAuthTokens({ access_token, refresh_token });
  queryClient.setQueryData(QUERY_KEYS.me, user);
  // Yangi akkaunt — "Ro'yxatdan o'tdingiz", qaytgan — "Xush kelibsiz" (ism bo'lmasa umumiy matn)
  const name = user.firstName?.trim();
  notify(
    name
      ? i18next.t(isNew ? "auth.registered" : "auth.welcomeBack", { name })
      : i18next.t(isNew ? "auth.registeredNoName" : "auth.loggedIn"),
  );
  // Saytda tanlangan til profilga yoziladi — keyingi testlar shu tilda
  const lang = currentLang();
  if (user.lang !== lang) {
    updateMe({ lang })
      .then((me) => queryClient.setQueryData(QUERY_KEYS.me, me))
      .catch(() => undefined);
  }
  useAuthStore.getState().finishLogin();
};

const useAuthSuccess = () => {
  const queryClient = useQueryClient();
  return (res: AuthResponse) => completeAuth(queryClient, res);
};

export const useLoginMutation = () =>
  useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: useAuthSuccess(),
    // PHONE_NOT_REGISTERED / PASSWORD_NOT_SET — formaning o'zida "Telegram orqali" tugmasi bilan ko'rsatiladi;
    // INVALID_CREDENTIALS, ACCOUNT_BLOCKED, TOO_MANY_REQUESTS — toast
    onError: (error) => {
      const code = getErrorCode(error);
      if (code !== "PHONE_NOT_REGISTERED" && code !== "PASSWORD_NOT_SET") notifyApiError(error);
    },
  });

// Ro'yxatdan o'tishning oxirgi qadami: Telegram tasdiqlagan so'rov + yangi parol → tokenlar.
// 404 — so'rov eskirgan (5 daqiqa): Telegram orqali qaytadan
export const useTelegramCompleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "telegram-complete"],
    mutationFn: ({ token, password }: { token: string; password: string }) => telegramComplete(token, password),
    onSuccess: (res) => completeAuth(queryClient, res),
    onError: (error) => {
      notifyApiError(error);
      if (getErrorCode(error) === "NOT_FOUND") useAuthStore.setState({ view: "telegram", telegramPending: null });
    },
  });
};

// Kod Telegram botga keladi. Javob har doim bir xil (raqam bor-yo'qligi oshkor qilinmaydi)
export const useForgotPasswordMutation = () =>
  useMutation({
    mutationKey: ["auth", "forgot-password"],
    mutationFn: (phone: string) => forgotPassword({ phone: toPhone(phone), lang: currentLang() }),
    onSuccess: (_res, phone) => {
      useAuthStore.getState().setView("reset", { phone, resendInSec: RESEND_SEC });
      notify(i18next.t("auth.forgotSent"), "info");
    },
    // CODE_SEND_FAILED, TOO_MANY_REQUESTS
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

// Zaxira: kirgan, lekin paroli yo'q foydalanuvchi (eski akkaunt) parol yaratadi — keyin telefon + parol bilan ham kiradi
export const useSetPasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["auth", "set-password"],
    mutationFn: (password: string) => setPassword(password),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(QUERY_KEYS.me, user);
      notify(i18next.t("auth.createPassword.saved"));
      useAuthStore.getState().finishLogin();
    },
    // PASSWORD_ALREADY_SET, VALIDATION_ERROR
    onError: notifyApiError,
  });
};

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
      notify(i18next.t("auth.loggedOut"), "info");
      queryClient.removeQueries({ queryKey: QUERY_KEYS.me });
      queryClient.removeQueries({ queryKey: ["attempts"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      if (isProtectedPath(window.location.pathname)) router.replace(ROUTES.home);
    },
  });
};
