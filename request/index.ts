import axios, { type InternalAxiosRequestConfig } from "axios";
import type { ApiError, PlanFeature } from "@/@types";
import { API_URL } from "@/lib/constants";
import { getQueryClient } from "@/lib/query-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { isProtectedPath, localePath, ROUTES, splitLocale } from "@/lib/routes";
import { refreshTokens } from "./auth";
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "./token";
import { usePaywallStore } from "@/store/paywall.store";

// Token bilan ishlaydigan so'rovlar. Mehmon uchun ham ishlaydi (token bo'lmasa header qo'shilmaydi)
export const request = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

request.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Bir vaqtda bir nechta so'rov 401 olsa, refresh faqat bir marta chaqiriladi
let refreshPromise: Promise<boolean> | null = null;

const runRefresh = () => {
  refreshPromise ??= (async () => {
    const token = getRefreshToken();
    if (!token) return false;
    try {
      saveAuthTokens(await refreshTokens(token));
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

// Sessiya tugadi: tokenlar o'chadi. Himoyalangan sahifadan variantlarga qaytariladi
const logout = () => {
  clearAuthTokens();
  if (typeof window === "undefined") return;
  const { pathname } = window.location;
  if (isProtectedPath(pathname)) window.location.href = localePath(splitLocale(pathname).lang, ROUTES.variants);
};

// Tarif bilan ochiladigan bo'lim (403 PREMIUM_REQUIRED): bitta joyda paywall oynasi ochiladi va
// tarif keshi yangilanadi (muddati tugagan bo'lishi mumkin). Xato komponentga ham qaytadi, lekin toast chiqmaydi
// (generics/notification). /me/explanations — jim: natija sahifasida qulf bloki o'zi ko'rinadi
const onPremiumRequired = (error: unknown) => {
  if (!axios.isAxiosError<ApiError>(error) || typeof window === "undefined") return;
  const data = error.response?.data;
  if (error.response?.status !== 403 || data?.code !== "PREMIUM_REQUIRED") return;
  getQueryClient().invalidateQueries({ queryKey: QUERY_KEYS.accessAll });
  if (error.config?.url?.includes("/me/explanations")) return;
  usePaywallStore.getState().openPaywall((data.params?.feature as PlanFeature | undefined) ?? null);
};

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    onPremiumRequired(error);
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      if (error.response?.status === 401) logout();
      return Promise.reject(error);
    }

    original._retry = true;
    if (await runRefresh()) return request(original);

    logout();
    return Promise.reject(error);
  },
);
