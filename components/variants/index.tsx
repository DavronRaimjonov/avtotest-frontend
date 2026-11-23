"use client";

import { useTranslation } from "react-i18next";
import { useVariantsQuery } from "@/hooks/useQuery";
import { useAuthStore } from "@/store/auth.store";
import { VARIANT_SIZES } from "@/lib/constants";
import { cn, percent } from "@/lib/helpers";
import { useExamStore } from "@/store/exam.store";
import { VariantGrid } from "./variant-grid";
import { VariantPanel } from "./variant-panel";

export const Variants = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const { size, setSize, selectedVariantId } = useExamStore();
  const { data, isPending, isError, refetch } = useVariantsQuery(size);

  const total = data?.total ?? 0;
  const solved = data?.solved ?? 0;
  // Hali tanlanmagan bo'lsa (yoki boshqa o'lchamga o'tilgan bo'lsa) birinchi variant
  const selected = data?.items.find((v) => v.id === selectedVariantId) ?? data?.items[0];

  // Keng ekranda panel chapda (380px, aylantirganda qotib turadi), torroqda grid ustida to'liq kenglikda
  return (
    <div className="mx-auto flex max-w-300 flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 lg:flex-row lg:items-start lg:pt-10">
      <VariantPanel variant={selected} passPercent={data?.passPercent} />

      <section className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[32px] font-extrabold tracking-tight">{t("variants.title")}</h1>
            <span className="text-[15px] text-muted">
              {total ? t("variants.subtitle", { total, size }) : t("variants.loading")}
            </span>
          </div>
          {/* Mehmonda natija saqlanmaydi — progress o'rniga kirishga taklif */}
          {hasSession ? (
            <div className="flex items-center gap-3 rounded-[14px] border border-line bg-white px-4 py-2.5">
              <span className="text-[13px] font-semibold text-muted">{t("variants.progress")}</span>
              <span className="block h-2 w-35 overflow-hidden rounded-full bg-soft">
                <span
                  className="block h-full rounded-full bg-ok transition-[width]"
                  style={{ width: `${percent(solved, total)}%` }}
                />
              </span>
              <b className="text-sm">
                {solved} / {total}
              </b>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLogin()}
              className="flex h-11 items-center rounded-[14px] border border-line bg-white px-4 text-[13px] font-bold text-navy hover:border-navy"
            >
              {t("variants.guestProgress")}
            </button>
          )}
        </div>

        <div className="flex gap-1.5 self-start rounded-xl bg-white p-1 ring-1 ring-line">
          {VARIANT_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={size === s}
              onClick={() => setSize(s)}
              className={cn(
                "h-9 rounded-[9px] border-0 px-3.5 text-[13px] font-bold",
                size === s ? "bg-navy text-white" : "bg-transparent text-slate",
              )}
            >
              {t("variants.size", { size: s })}
            </button>
          ))}
        </div>

        {isError ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-bad-line bg-bad-bg p-6 text-bad-text">
            <b>{t("variants.loadError")}</b>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-10 rounded-[10px] bg-navy px-4 text-sm font-bold text-white"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : (
          <VariantGrid
            variants={data?.items}
            selectedId={selected?.id}
            passPercent={data?.passPercent}
            loading={isPending}
          />
        )}
      </section>
    </div>
  );
};
