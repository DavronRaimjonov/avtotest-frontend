import axios from "axios";
import type {
  AuthResponse,
  AuthTokens,
  CodeSentResponse,
  ForgotPasswordBody,
  LoginBody,
  ResetPasswordBody,
  TelegramStart,
  TelegramStatus,
  TestLang,
} from "@/@types";
import { API_URL } from "@/lib/constants";

// Token kerak bo'lmagan auth endpointlari (interceptor'siz — refresh aylanib qolmasin).
// Kirish faqat Telegram bot orqali yoki telefon + parol (email va Google olib tashlangan)
export const authRequest = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const post = <T>(url: string, body: unknown) => authRequest.post<T>(`/landing/auth${url}`, body).then((r) => r.data);

// Telegram orqali kirish: { token, code, botUrl }. 503 TELEGRAM_AUTH_DISABLED — bot sozlanmagan
export const telegramStart = (lang: TestLang) => post<TelegramStart>("/telegram/start", { lang });

// Har 2 soniyada. confirmed — tokenlar faqat bir marta, keyingi so'rov "used" beradi
export const telegramStatus = (token: string) =>
  authRequest.get<TelegramStatus>(`/landing/auth/telegram/status/${token}`).then((r) => r.data);

// Ro'yxatdan o'tishni yakunlash: status=password_required bo'lganda parol yaratiladi → tokenlar.
// 404 — so'rov eskirgan (Telegram orqali qaytadan), 409 PASSWORD_ALREADY_SET
export const telegramComplete = (token: string, password: string) =>
  post<AuthResponse>("/telegram/complete", { token, password });

// Telefon + parol. 401 PHONE_NOT_REGISTERED / PASSWORD_NOT_SET / INVALID_CREDENTIALS
export const login = (body: LoginBody) => post<AuthResponse>("/login", body);

// Kod Telegram botga keladi. Raqam bor-yo'qligidan qat'i nazar bir xil javob
export const forgotPassword = (body: ForgotPasswordBody) => post<CodeSentResponse>("/forgot-password", body);

// Yangi parol o'rnatiladi va tizimga kiradi (boshqa qurilmalar chiqariladi)
export const resetPassword = (body: ResetPasswordBody) => post<AuthResponse>("/reset-password", body);

export const refreshTokens = (refreshToken: string) => post<AuthTokens>("/refresh", { refreshToken });
