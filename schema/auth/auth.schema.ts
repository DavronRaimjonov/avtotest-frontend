import { z } from "zod";
import i18n from "@/i18n";
import { OTP_LENGTH } from "@/lib/constants";
import { isValidPhone } from "@/lib/helpers";

// Xatolar matni validatsiya paytida joriy tilda olinadi. Qoidalar backend bilan bir xil (FRONTEND-API.md 2.1)
// Kamida 8 belgi, kamida bitta harf va bitta raqam
export const passwordSchema = z
  .string()
  .min(8, { error: () => i18n.t("validation.passwordMin") })
  .max(72, { error: () => i18n.t("validation.passwordMax") })
  .refine((v) => /\p{L}/u.test(v) && /\d/.test(v), { error: () => i18n.t("validation.passwordRule") });

export const codeSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), { error: () => i18n.t("validation.code", { length: OTP_LENGTH }) });

// Telefon: +998 va 9 raqam yoki boshqa davlat (+ va 10–15 raqam). Bo'shliq/tire maska qo'yadi, server tozalaydi
export const phoneSchema = z
  .string()
  .trim()
  .refine(isValidPhone, { error: () => i18n.t("validation.phone") });

const required = () => z.string().min(1, { error: () => i18n.t("validation.required") });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: required(),
});

export const forgotSchema = z.object({ phone: phoneSchema });

// "Parol yarating": parol va takrorlash bir xil bo'lsin
export const setPasswordSchema = z
  .object({ password: passwordSchema, repeat: z.string() })
  .refine((v) => v.password === v.repeat, { path: ["repeat"], error: () => i18n.t("validation.passwordMismatch") });

export const resetSchema = z.object({ code: codeSchema, newPassword: passwordSchema });

export const changePasswordSchema = z.object({ currentPassword: required(), newPassword: passwordSchema });
