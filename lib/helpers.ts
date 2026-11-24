import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiError, ApiErrorCode } from "@/@types";
import i18next from "@/i18n";
import uzb from "@/i18n/locales/uzb.json";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// 874 → "14:34"
export const formatTime = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// 18.11.2026 — barcha tillarda bir xil (brauzerning o'zbekcha Intl formati "2026 M11 18" beradi)
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

export const percent = (part: number, total: number) =>
  total ? Math.round((part / total) * 100) : 0;

// Backend xato kodlari bo'yicha matn (message faqat o'zbekcha, code esa o'zgarmaydi) — joriy tilda
const KNOWN_CODES = new Set<string>(Object.keys(uzb.errors));

export const getErrorCode = (error: unknown): ApiErrorCode | undefined => {
  if (!isAxiosError<ApiError>(error)) return undefined;
  const code = error.response?.data?.code;
  if (code) return code;
  if (error.response?.status === 429) return "TOO_MANY_REQUESTS";
  return undefined;
};

export const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error) && !error.response) return i18next.t("errors.network");
  const code = getErrorCode(error);
  // params — matnga qo'yiladigan qiymatlar (masalan, OTP_TOO_SOON: { seconds })
  const params = isAxiosError<ApiError>(error) ? error.response?.data?.params : undefined;
  return i18next.t(code && KNOWN_CODES.has(code) ? `errors.${code}` : "errors.unexpected", params);
};

// 70000 → "70 000 so'm" (valyuta nomi joriy tilda: so'm / сўм / сум / сом)
export const formatPrice = (amount: number) =>
  `${new Intl.NumberFormat("ru-RU").format(amount).replace(/ | /g, " ")} ${i18next.t("pricing.currency")}`;

// Muddatgacha qolgan to'liq kunlar (o'tib ketgan bo'lsa 0)
export const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

// Kalendar kunlari farqi: bugun — 0, ertaga — 1, kecha — -1
export const dayDiff = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86_400_000);
};

// "10:06"
export const formatClock = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
