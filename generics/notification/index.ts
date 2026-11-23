import { toast } from "sonner";
import { getErrorCode, getErrorMessage } from "@/lib/helpers";

export const notify = (message: string, type: "success" | "info" = "success") => {
  toast[type](message);
};

// Backend xatolari: kod bo'yicha matn (lib/helpers.ts)
// PREMIUM_REQUIRED — toast o'rniga paywall oynasi ochiladi (request/index.ts)
export const notifyApiError = (error: unknown) => {
  if (getErrorCode(error) === "PREMIUM_REQUIRED") return;
  toast.error(getErrorMessage(error));
};
