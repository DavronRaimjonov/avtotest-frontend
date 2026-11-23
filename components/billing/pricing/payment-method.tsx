"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { PaymentProvider, Plan } from "@/@types";
import { CardIcon, XIcon } from "@/components/ui/icons";
import { TELEGRAM_URL } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/helpers";
import { useCreateOrderMutation } from "@/request/mutation";

const PROVIDER_LABELS: Record<PaymentProvider, string> = { click: "Click", payme: "Payme" };

type Props = {
  plan: Plan;
  providers: PaymentProvider[];
  // Faol tarif bo'lsa — oxirgi kirish kuni (yangi davr shundan keyin boshlanishi mumkin)
  activeUntil: string | null;
  onClose: () => void;
};

// To'lov usulini tanlash: faqat serverda ulangan tizimlar (providers). Tanlangach POST /orders →
// paymentUrl ga shu tabda o'tiladi; sahifa almashguncha tugmalar bloklanadi (ikki marta bosilmasin)
export const PaymentMethodModal = ({ plan, providers, activeUntil, onClose }: Props) => {
  const { t } = useTranslation();
  const order = useCreateOrderMutation();
  const busy = order.isPending || order.isSuccess;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-navy/60 sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-105 animate-sheet-up flex-col gap-5 rounded-t-3xl bg-white p-6 pb-[max(24px,env(safe-area-inset-bottom))] text-ink shadow-float sm:animate-fade-in sm:rounded-3xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label={t("common.close")}
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg disabled:opacity-50"
        >
          <XIcon size={18} />
        </button>
        <div className="flex flex-col gap-1 pr-10">
          <h2 id="pay-title" className="m-0 text-[22px] font-extrabold tracking-tight">
            {t("payment.chooseMethod")}
          </h2>
          <span className="text-[15px] text-slate">
            {t("payment.summary", { plan: plan.title, price: formatPrice(plan.priceUzs), count: plan.durationDays })}
          </span>
        </div>

        {activeUntil && (
          <p className="m-0 rounded-xl bg-bg px-4 py-3 text-[13px] leading-relaxed text-slate">
            {t("payment.queueNote", { date: formatDate(activeUntil) })}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {providers.map((provider) => (
            <button
              key={provider}
              type="button"
              disabled={busy}
              onClick={() => order.mutate({ planId: plan.id, provider })}
              className="btn-hover flex h-14 items-center justify-center gap-2 rounded-xl border-[1.5px] border-line bg-white text-[17px] font-extrabold text-ink hover:border-navy-2 disabled:cursor-wait disabled:opacity-60"
            >
              {busy && order.variables?.provider === provider ? t("payment.redirecting") : PROVIDER_LABELS[provider]}
            </button>
          ))}
        </div>

        <p className="m-0 flex items-start gap-2 text-[13px] leading-relaxed text-muted">
          <CardIcon size={18} className="mt-px flex-none text-navy-2" />
          <span>
            {t("payment.cashNote")}{" "}
            {TELEGRAM_URL !== "#" && (
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="font-bold text-navy-2">
                Telegram
              </a>
            )}
          </span>
        </p>
      </div>
    </div>
  );
};
