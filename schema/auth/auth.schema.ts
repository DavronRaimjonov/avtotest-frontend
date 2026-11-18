import { z } from "zod";
import i18n from "@/i18n";
import { OTP_LENGTH } from "@/lib/constants";

// Xatolar matni validatsiya paytida joriy tilda olinadi. Qoidalar backend bilan bir xil (FRONTEND-API.md 2.1)
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: () => i18n.t("validation.email") }));

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

const required = () => z.string().min(1, { error: () => i18n.t("validation.required") });

export const loginSchema = z.object({
  email: emailSchema,
  password: required(),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t("validation.required") })
    .max(50, { error: () => i18n.t("validation.nameMax") }),
  lastName: z
    .string()
    .trim()
    .max(50, { error: () => i18n.t("validation.nameMax") })
    .transform((v) => v || undefined),
  email: emailSchema,
  password: passwordSchema,
});

export const verifySchema = z.object({ code: codeSchema });

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({ code: codeSchema, newPassword: passwordSchema });

export const changePasswordSchema = z.object({ currentPassword: required(), newPassword: passwordSchema });
