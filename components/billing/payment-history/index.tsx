"use client";

import { useTranslation } from "react-i18next";
import type { OrderProvider } from "@/@types";
import { useOrdersQuery } from "@/hooks/useQuery";
import { cn, formatDate, formatPrice } from "@/lib/helpers";

const PROVIDER_LABELS: Record<Exclude<OrderProvider, "manual">, string> = { click: "Click", payme: "Payme" };

// Mening to'lovlarim (paid va refunded) — profil sahifasida. Bo'sh bo'lsa ko'rsatilmaydi
export const PaymentHistory = () => {
  const { t } = useTranslation();
  const { data } = useOrdersQuery();
  if (!data?.items.length) return null;

  return (
    <section className="flex w-full flex-col gap-3 rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <h2 className="m-0 text-lg font-extrabold">{t("account.payments")}</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {data.items.map((o) => (
          <li
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line py-3 text-sm first:border-t-0"
          >
            <span className="flex flex-col">
              <b className="text-ink">{o.planTitle}</b>
              <span className="text-[13px] text-muted">
                {formatDate(o.paidAt ?? o.createdAt)} ·{" "}
                {o.provider === "manual" ? t("account.manual") : PROVIDER_LABELS[o.provider]}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <b className={cn(o.status === "refunded" && "text-subtle line-through")}>{formatPrice(o.amount)}</b>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold",
                  o.status === "paid" ? "bg-ok-bg text-ok-text" : "bg-bg text-muted",
                )}
              >
                {t(`payment.status.${o.status}`)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
