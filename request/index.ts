import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/constants";
import { isProtectedPath, localePath, ROUTES, splitLocale } from "@/lib/routes";
import { refreshTokens } from "./auth";
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "./token";

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

request.interceptors.response.use(
  (response) => response,
  async (error) => {
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
