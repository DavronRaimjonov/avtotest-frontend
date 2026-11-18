"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, GlobeIcon } from "@/components/ui/icons";
import { useLang } from "@/hooks/useLang";
import { TEST_LANGS } from "@/lib/constants";
import { cn } from "@/lib/helpers";

// Interfeys va test tili: O'zbekcha (lotin), Ўзбекча (кирилл), Русский
export const LangSwitcher = () => {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = TEST_LANGS.find((l) => l.value === lang) ?? TEST_LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("common.chooseLang")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-[10px] border border-white/20 px-3 text-sm font-semibold"
      >
        <GlobeIcon size={16} />
        {active.short}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("common.chooseLang")}
          className="absolute top-12 right-0 z-40 m-0 flex w-44 animate-fade-in list-none flex-col gap-0.5 rounded-2xl border border-line bg-white p-1.5 text-ink shadow-float"
        >
          {TEST_LANGS.map((l) => (
            <li key={l.value}>
              <button
                type="button"
                role="option"
                aria-selected={l.value === lang}
                onClick={() => {
                  setLang(l.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-[10px] px-3 text-left text-sm font-bold hover:bg-bg",
                  l.value === lang && "text-navy",
                )}
              >
                {l.label}
                {l.value === lang && <CheckIcon size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
