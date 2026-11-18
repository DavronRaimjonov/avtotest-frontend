"use client";

import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  const columns = t("footer.columns", { returnObjects: true }) as { title: string; links: string[] }[];

  return (
    <footer className="bg-navy text-[#B9C3DD]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 px-6 pt-14 pb-8">
        <div className="flex flex-col gap-3">
          <span className="text-xl font-extrabold text-white">
            Avto<span className="text-accent">Test</span>
          </span>
          <span className="text-sm leading-relaxed">{t("footer.about")}</span>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5 text-sm">
            <b className="text-xs tracking-[0.08em] text-white">{col.title}</b>
            {col.links.map((label) => (
              <a key={label} href="#" className="no-underline transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1200px] border-t border-white/10 px-6 pt-5 pb-8 text-[13px]">{t("footer.rights")}</div>
    </footer>
  );
};
