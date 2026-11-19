"use client";

import { useTranslation } from "react-i18next";
import type { Variant } from "@/@types";
import { PlayIcon } from "@/components/ui/icons";
import {
  EXAM_DURATION_MIN,
  EXAM_MODES,
  EXAM_QUESTION_COUNT,
  PASS_PERCENT,
  TEST_LANGS,
} from "@/lib/constants";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/helpers";
import { useStartAttempt } from "@/request/mutation";
import { useExamStore } from "@/store/exam.store";

// Chap panel: til, tanlangan variant, rejim va "Testni boshlash".
// Test tili = ilova tili (header'dagi bilan bir xil). Mehmon ham boshlay oladi — /guest/tests
export const VariantPanel = ({ variant, passPercent = PASS_PERCENT }: { variant?: Variant; passPercent?: number }) => {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { mode, setMode } = useExamStore();
  const { start, isPending } = useStartAttempt();
  const result = variant?.result;
  const minutes = variant ? Math.round(variant.timeLimitSec / 60) : EXAM_DURATION_MIN;

  return (
    <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-24 lg:w-[380px] lg:flex-none">
      <div className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-bold text-muted">{t("variants.testLang")}</span>
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-bg p-1 sm:grid-cols-4">
            {TEST_LANGS.map((l) => (
              <button
                key={l.value}
                type="button"
                aria-pressed={lang === l.value}
                onClick={() => setLang(l.value)}
                className={cn(
                  "h-10 rounded-[9px] border-0 text-[13px] font-bold",
                  lang === l.value ? "bg-navy text-white" : "bg-transparent text-slate",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-[20px] bg-navy px-6 py-7 text-white">
          <span className="text-[13px] font-bold tracking-[0.06em] text-pale">{t("variants.selected")}</span>
          <span className="text-7xl leading-none font-extrabold text-accent">{variant?.number ?? "—"}</span>
          <span className="text-sm text-pale">
            {result ? t("variants.lastResult", { percent: result.lastPercent }) : t("variants.notSolved")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { v: variant?.questionCount ?? EXAM_QUESTION_COUNT, l: t("variants.questions") },
            { v: minutes, l: t("variants.minutes") },
            { v: `${passPercent}%`, l: t("variants.passMark"), ok: true },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-0.5 rounded-[14px] border border-line px-2 py-3.5">
              <b className={cn("text-[22px]", s.ok && "text-ok-text")}>{s.v}</b>
              <span className="text-xs text-muted">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-bold text-muted">{t("variants.mode")}</span>
          {EXAM_MODES.map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => setMode(m)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 text-ink",
                  on ? "border-navy bg-bg" : "border-line bg-white",
                )}
              >
                <span
                  className={cn(
                    "box-border size-5 flex-none rounded-full",
                    on ? "border-[6px] border-navy" : "border-2 border-[#B6BFD1]",
                  )}
                />
                <span className="flex flex-col gap-0.5 text-left">
                  <b className="text-[15px]">{t(`mode.${m}.title`)}</b>
                  <span className="text-[13px] font-medium text-muted">{t(`mode.${m}.desc`)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!variant || isPending}
          onClick={() => variant && start({ source: "variant", variantId: variant.id, mode, lang })}
          className="btn-hover flex h-14 items-center justify-center gap-2.5 rounded-[14px] bg-accent text-base font-extrabold text-navy disabled:opacity-60"
        >
          <PlayIcon />
          {isPending ? t("common.starting") : t("common.start")}
        </button>
      </div>
    </aside>
  );
};
