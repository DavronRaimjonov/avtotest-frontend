"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SavedQuestion } from "@/@types";
import { LockedExplanation } from "@/components/billing/locked-explanation";
import { MnemonicBlock } from "@/components/mnemonic";
import { CheckIcon, ChevronRightIcon, ImageIcon, XIcon } from "@/components/ui/icons";
import { useAccess } from "@/hooks/useAccess";
import { cn } from "@/lib/helpers";

type Props = {
  item: SavedQuestion;
  // Saqlangan sana yoki "N marta xato · oxirgi xato" — yopiq qatorda
  meta: React.ReactNode;
  // "Xatolarim": foydalanuvchi oxirgi marta tanlagan noto'g'ri javob — qizil bilan
  myAnswerId?: number | null;
  onRemove: () => void;
};

// Ixcham accordion: yopiq holatda bitta qator (rasm, raqam, sana, savolning 2 qatori) — ekranga 6–8 ta sig'adi.
// Bosilganda javoblar (to'g'ri — yashil, xatolarda tanlangan — qizil), rasm, izoh va "Olib tashlash" ochiladi
export const QuestionCard = ({ item, meta, myAnswerId, onRemove }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const answers = [...item.answers].sort((a, b) => a.position - b.position);
  const panelId = `q-${item.id}`;
  // Izohlar faqat tarif bilan: tarifsizga explanation null keladi — o'rnida qulf bloki
  const { has, isLoading } = useAccess();
  const explanationsLocked = !isLoading && !has("explanations");

  return (
    <article className={cn("rounded-2xl border bg-white transition-colors", open ? "border-navy/40" : "border-line")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
      >
        <span className="relative flex size-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-img sm:size-16">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <ImageIcon size={20} className="text-subtle" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <b className="text-navy-2">{t("questions.number", { id: item.id })}</b>
            <span className="text-muted">{meta}</span>
          </span>
          <span className={cn("text-[15px] leading-snug font-semibold text-ink", !open && "line-clamp-2")}>
            {item.text}
          </span>
        </span>
        <ChevronRightIcon
          size={18}
          strokeWidth={2.2}
          className={cn("flex-none text-subtle transition-transform", open && "rotate-90")}
        />
      </button>

      {open && (
        <div id={panelId} className="flex animate-fade-in flex-col gap-4 border-t border-line px-3 pt-4 pb-3 sm:px-4 sm:pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
              {answers.map((a) => {
                const correct = a.id === item.correctAnswerId;
                const mine = !correct && a.id === myAnswerId;
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-[15px] leading-normal",
                      correct && "border-ok bg-ok-bg font-semibold text-ink",
                      mine && "border-bad bg-bad-bg text-ink",
                      !correct && !mine && "border-line text-slate",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6.5 w-8 flex-none items-center justify-center rounded-[7px] text-xs font-extrabold",
                        correct ? "bg-ok text-white" : mine ? "bg-bad text-white" : "bg-bg text-slate",
                      )}
                    >
                      F{a.position}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {a.text}
                      {mine && <span className="text-xs font-bold text-bad-text">{t("questions.yourAnswer")}</span>}
                      {correct && myAnswerId != null && (
                        <span className="text-xs font-bold text-ok-text">{t("questions.correctAnswer")}</span>
                      )}
                    </span>
                    {correct && (
                      <CheckIcon size={20} strokeWidth={2.6} className="flex-none text-ok-text" aria-label={t("questions.correctAnswer")} />
                    )}
                    {mine && (
                      <XIcon size={20} strokeWidth={2.6} className="flex-none text-bad-text" aria-label={t("questions.yourAnswer")} />
                    )}
                  </li>
                );
              })}
            </ul>

            {item.imageUrl && (
              <div className="relative aspect-4/3 w-full flex-none overflow-hidden rounded-2xl border border-line bg-img md:w-65">
                <Image src={item.imageUrl} alt={item.text} fill unoptimized className="object-contain" />
              </div>
            )}
          </div>

          {explanationsLocked ? (
            <LockedExplanation />
          ) : item.explanation && (
            <p className="m-0 rounded-xl bg-bg px-4 py-3 text-sm leading-relaxed text-slate">
              <b className="text-ink">{t("questions.explanation")}: </b>
              {item.explanation}
            </p>
          )}
          <MnemonicBlock mnemonic={item.mnemonic} mnemonicLocked={item.mnemonicLocked} />

          <div className="flex items-center justify-between gap-3">
            {item.topic ? <span className="text-[13px] font-semibold text-muted">{item.topic.name}</span> : <span />}
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 flex-none items-center gap-1.5 rounded-[10px] border border-line px-3 text-[13px] font-bold text-slate hover:border-bad-line hover:bg-bad-bg hover:text-bad-text"
            >
              <XIcon size={16} strokeWidth={2.4} />
              {t("questions.remove")}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
