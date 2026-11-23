"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderBody } from "@/@types";
import { notifyApiError } from "@/generics/notification";
import { currentLang } from "@/i18n";
import { getErrorCode } from "@/lib/helpers";
import { createOrder } from "../billing";

// Buyurtma → Click / Payme sahifasiga shu tabda o'tiladi. Sahifa almashguncha tugma bloklanib turadi
// (isPending + redirecting), shuning uchun ikki marta bosilmaydi
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["orders", "create"],
    mutationFn: (body: Omit<CreateOrderBody, "lang">) => createOrder({ ...body, lang: currentLang() }),
    onSuccess: (order) => {
      window.location.href = order.paymentUrl;
    },
    onError: (error) => {
      // Tarif "Tez kunda" bo'lib qolgan yoki yashirilgan — ro'yxat yangilanadi
      if (getErrorCode(error) === "PLAN_NOT_AVAILABLE") {
        queryClient.invalidateQueries({ queryKey: ["plans"] });
      }
      // PAYMENT_PROVIDER_DISABLED, TOO_MANY_REQUESTS, UNAUTHORIZED
      notifyApiError(error);
    },
  });
};
