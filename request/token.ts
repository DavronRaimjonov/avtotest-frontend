import Cookies from "js-cookie";
import type { AuthTokens } from "@/@types";
import {
  ACCESS_TOKEN_DAYS,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_DAYS,
  REFRESH_TOKEN_KEY,
} from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";

// Cookie'da saqlanadi, shunda proxy.ts ham tokenni ko'ra oladi
export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

export const hasAuthTokens = () => !!(getAccessToken() || getRefreshToken());

// Production'da (https) cookie faqat shifrlangan ulanishda yuboriladi
const options = (expires: number) => ({
  expires,
  sameSite: "lax" as const,
  secure: typeof location !== "undefined" && location.protocol === "https:",
});

export const saveAuthTokens = ({ access_token, refresh_token }: AuthTokens) => {
  Cookies.set(ACCESS_TOKEN_KEY, access_token, options(ACCESS_TOKEN_DAYS));
  Cookies.set(REFRESH_TOKEN_KEY, refresh_token, options(REFRESH_TOKEN_DAYS));
  useAuthStore.getState().setHasSession(true);
};

export const clearAuthTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  useAuthStore.getState().setHasSession(false);
};
