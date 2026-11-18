import axios from "axios";
import type {
  AuthResponse,
  AuthTokens,
  CodeSentResponse,
  ForgotPasswordBody,
  GoogleLoginBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from "@/@types";
import { API_URL } from "@/lib/constants";

// Token kerak bo'lmagan auth endpointlari (interceptor'siz — refresh aylanib qolmasin)
export const authRequest = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const post = <T>(url: string, body: unknown) => authRequest.post<T>(`/landing/auth${url}`, body).then((r) => r.data);

// Ro'yxatdan o'tish: emailga 6 xonali kod boradi (tasdiqlanmagan email bilan qayta chaqirsa bo'ladi)
export const register = (body: RegisterBody) => post<CodeSentResponse>("/register", body);

// Kod tasdiqlangach tizimga kiradi
export const verifyEmail = (body: VerifyEmailBody) => post<AuthResponse>("/verify-email", body);

// 60 soniyadan keyin (aks holda 429 OTP_TOO_SOON, params.seconds)
export const resendCode = (email: string) => post<CodeSentResponse>("/resend-code", { email });

// 403 EMAIL_NOT_VERIFIED — server kodni o'zi qayta yuboradi, kod oynasini ochish kerak
export const login = (body: LoginBody) => post<AuthResponse>("/login", body);

// Email ro'yxatda bor-yo'qligidan qat'i nazar bir xil javob
export const forgotPassword = (body: ForgotPasswordBody) => post<CodeSentResponse>("/forgot-password", body);

// Yangi parol o'rnatiladi va tizimga kiradi (boshqa qurilmalar chiqariladi)
export const resetPassword = (body: ResetPasswordBody) => post<AuthResponse>("/reset-password", body);

// Google Identity Services bergan credential (ID token). Shu email bilan akkaunt bo'lsa unga ulanadi
export const googleLogin = (body: GoogleLoginBody) => post<AuthResponse>("/google", body);

export const refreshTokens = (refreshToken: string) => post<AuthTokens>("/refresh", { refreshToken });
