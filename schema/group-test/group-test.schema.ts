import { z } from "zod";
import i18n from "@/i18n";
import { GROUP_CODE_LENGTH } from "@/lib/constants";

// Jamoaviy testga qo'shilish kodi: faqat raqamlar (backend bo'shliqlarni ham olib tashlaydi)
export const groupCodeSchema = z.object({
  code: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(new RegExp(`^\\d{${GROUP_CODE_LENGTH}}$`), {
          error: () => i18n.t("validation.code", { length: GROUP_CODE_LENGTH }),
        }),
    ),
});
