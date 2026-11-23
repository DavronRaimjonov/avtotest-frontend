import { z } from "zod";
import i18n from "@/i18n";

// PATCH /me: ism majburiy (1–50), familiya ixtiyoriy (bo'sh — o'chiriladi)
export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t("validation.required") })
    .max(50, { error: () => i18n.t("validation.nameMax") }),
  lastName: z
    .string()
    .trim()
    .max(50, { error: () => i18n.t("validation.nameMax") }),
});
