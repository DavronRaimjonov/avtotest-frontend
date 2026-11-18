"use client";

import { useTranslation } from "react-i18next";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";

// idle — tanlanmagan; selected — imtihon rejimida tanlangan (to'g'ri/xato ko'rsatilmaydi)
export type OptionState = "idle" | "selected" | "correct" | "wrong";

type Props = {
  optionKey: string;
  text: string;
  state: OptionState;
  size?: "sm" | "md";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const box: Record<OptionState, string> = {
  idle: "bg-white border-line",
  selected: "bg-[#EEF2FB] border-navy",
  correct: "bg-ok-bg border-ok animate-pop",
  wrong: "bg-bad-bg border-bad animate-shake",
};

const keyBox: Record<OptionState, string> = {
  idle: "bg-bg text-slate",
  selected: "bg-navy text-white",
  correct: "bg-ok text-white",
  wrong: "bg-bad text-white",
};

// Javob varianti: chapda F1/F2 tugmasi, o'ngda to'g'ri/xato belgisi
export const AnswerOption = ({
  optionKey,
  text,
  state,
  size = "md",
  disabled,
  onClick,
  className,
  style,
}: Props) => {
  const { t } = useTranslation();
  return (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={cn(
      "flex w-full items-center gap-3 border-[1.5px] text-left font-semibold text-ink transition-[transform,border-color,background] hover:translate-x-[3px] disabled:cursor-default disabled:hover:translate-x-0",
      size === "md" ? "min-h-[60px] gap-3.5 rounded-2xl px-4 py-3.5 text-base" : "min-h-[52px] rounded-xl px-3.5 py-2.5 text-[15px]",
      box[state],
      className,
    )}
  >
    <span
      className={cn(
        "flex flex-none items-center justify-center font-extrabold transition-colors",
        size === "md" ? "h-8 w-[38px] rounded-[9px] text-[13px]" : "h-[26px] w-[30px] rounded-[7px] text-xs",
        keyBox[state],
      )}
    >
      {optionKey}
    </span>
    <span className="flex-1 leading-normal">{text}</span>
    {state === "correct" && <CheckIcon size={22} className="animate-fade-in text-ok-text" aria-label={t("test.correctAnswer")} />}
    {state === "wrong" && <XIcon size={22} className="animate-fade-in text-bad-text" aria-label={t("test.wrongAnswer")} />}
  </button>
  );
};
