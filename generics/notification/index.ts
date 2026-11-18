import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helpers";

export const notify = (message: string, type: "success" | "info" = "success") => {
  toast[type](message);
};

// Backend xatolari: kod bo'yicha matn (lib/helpers.ts)
export const notifyApiError = (error: unknown) => {
  toast.error(getErrorMessage(error));
};
