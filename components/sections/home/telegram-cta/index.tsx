"use client";

import { useTranslation } from "react-i18next";
import { SendIcon } from "@/components/ui/icons";
import { TELEGRAM_URL } from "@/lib/constants";

export const TelegramCta = () => {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="flex flex-wrap items-center gap-8 rounded-[28px] bg-accent p-8 sm:p-12">
        <div className="flex flex-[1_1_420px] flex-col gap-3 text-navy">
          <h2 className="m-0 text-[28px] font-extrabold tracking-tight sm:text-[36px]">{t("telegram.title")}</h2>
          <p className="m-0 text-[17px] leading-relaxed">{t("telegram.text")}</p>
        </div>
        <a
          href={TELEGRAM_URL}
          className="btn-hover flex h-14 items-center gap-2.5 rounded-[14px] bg-navy px-[26px] font-bold text-white no-underline"
        >
          <SendIcon className="animate-plane" />
          {t("telegram.join")}
        </a>
      </div>
    </section>
  );
};
