"use client";

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { Variant } from "@/@types";
import { LockIcon } from "@/components/ui/icons";
import { PASS_PERCENT } from "@/lib/constants";
import { cn } from "@/lib/helpers";
import { useExamStore } from "@/store/exam.store";

// Yashil — o'tgan (bestPercent >= passPercent), to'q sariq — yechilgan lekin o'tmagan, oq — yangi
const tone = (t: TFunction, result: Variant["result"]) => {
  if (!result) return { box: "bg-white border-line", sub: "text-subtle", label: t("variants.new") };
  if (result.passed) return { box: "bg-ok-bg border-ok", sub: "text-ok-text", label: `${result.lastPercent}%` };
  return { box: "bg-warn-bg border-warn", sub: "text-warn-text", label: `${result.lastPercent}%` };
};

type Props = {
  variants?: Variant[];
  selectedId?: number;
  passPercent?: number;
  loading: boolean;
};

export const VariantGrid = ({ variants, selectedId, passPercent = PASS_PERCENT, loading }: Props) => {
  const { t } = useTranslation();
  const setSelectedVariantId = useExamStore((s) => s.setSelectedVariantId);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5">
        {loading
          ? Array.from({ length: 64 }, (_, i) => (
              <span key={i} className="h-18 animate-pulse rounded-[14px] bg-soft" />
            ))
          : variants?.map((v) => {
              const c = tone(t, v.result);
              const selected = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-label={t("variants.variant", { number: v.number })}
                  aria-pressed={selected}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={cn(
                    "flex h-18 flex-col items-center justify-center gap-0.5 rounded-[14px] text-ink transition-transform hover:-translate-y-0.5",
                    c.box,
                    selected
                      ? "border-[2.5px] border-navy shadow-[0_6px_16px_-6px_rgba(14,26,58,0.45)]"
                      : "border-[1.5px]",
                  )}
                >
                  <span className="text-lg font-extrabold">{v.number}</span>
                  {/* Mehmonda 4-variantdan boshlab: kirish kerak (tanlash mumkin, boshlashda kirish oynasi) */}
                  {v.requiresLogin ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-subtle">
                      <LockIcon size={11} strokeWidth={2.6} />
                      {t("guestLimits.badge")}
                    </span>
                  ) : (
                    <span className={cn("text-[11px] font-bold", c.sub)}>{c.label}</span>
                  )}
                </button>
              );
            })}
      </div>

      <div className="flex flex-wrap gap-5 text-[13px] font-semibold text-muted">
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded border-[1.5px] border-ok bg-ok-bg" />
          {t("variants.legendPass", { pass: passPercent })}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded border-[1.5px] border-warn bg-warn-bg" />
          {t("variants.legendFail", { pass: passPercent })}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded border-[1.5px] border-line bg-white" />
          {t("variants.legendNew")}
        </span>
      </div>
    </>
  );
};
