"use client";

import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

type Props = {
  okCount: number;
  badCount: number;
  // Imtihonda yana nechta xato mumkin, mashqda null
  mistakesLeft: number | null;
  // Hisoblar o'rniga (jamoaviy testda to'g'ri/xato ko'rsatilmaydi — "Javob berildi: 5 / 20")
  status?: React.ReactNode;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const TestFooter = ({ okCount, badCount, mistakesLeft, status, isFirst, isLast, onPrev, onNext }: Props) => {
  const { t } = useTranslation();
  return (
  <footer className="sticky bottom-0 border-t border-line bg-white">
    <div className="mx-auto flex max-w-310 items-center gap-3 px-4 py-3.5 sm:px-6">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="flex h-12 items-center gap-2 rounded-xl border-[1.5px] border-line bg-white px-4.5 text-[15px] font-bold text-ink disabled:opacity-50"
      >
        <ChevronLeftIcon size={18} />
        <span className="max-sm:sr-only">{t("test.prev")}</span>
      </button>
      <span className="mx-auto flex flex-wrap justify-center gap-x-3.5 gap-y-0.5 text-sm font-semibold text-muted">
        {status ?? (
          <>
            <span className="text-ok-text">{t("test.correctCount", { count: okCount })}</span>
            <span className="text-bad-text">{t("test.wrongCount", { count: badCount })}</span>
            {mistakesLeft !== null && (
              <span className={mistakesLeft === 0 ? "font-bold text-bad-text" : undefined}>
                {t("test.mistakesLeft", { count: mistakesLeft })}
              </span>
            )}
          </>
        )}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="flex h-12 items-center gap-2 rounded-xl border-0 bg-accent px-5.5 text-[15px] font-extrabold text-navy disabled:opacity-50"
      >
        {t("test.next")}
        <ChevronRightIcon size={18} />
      </button>
    </div>
  </footer>
  );
};
