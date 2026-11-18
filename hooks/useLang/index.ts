"use client";

import { useTranslation } from "react-i18next";
import type { TestLang } from "@/@types";
import { toLanguage } from "@/i18n";
import { localePath, splitLocale } from "@/lib/routes";
import { updateMe } from "@/request/user";
import { useAuthStore } from "@/store/auth.store";

// Profilga yozish sahifa almashishini ko'p kutdirmasin
const SAVE_TIMEOUT_MS = 1500;

// Ilova tili URL'dan: / (uzb), /uzc/..., /ru/... Interfeys matnlari va API'dagi ?lang= (test tili) bir xil.
// Til almashtirish — shu sahifaning boshqa tildagi manziliga TO'LIQ o'tish (window.location):
// client router prefikssiz (rewrite qilingan) manzilga o'tganda root layout'ni qayta chizmaydi va matn eski tilda
// qolib ketadi. Kirgan foydalanuvchida til avval profilga yoziladi (keyingi testlar uchun default)
export const useLang = () => {
  const { i18n } = useTranslation();
  const lang = toLanguage(i18n.language);

  const setLang = async (next: TestLang) => {
    if (next === lang) return;
    if (useAuthStore.getState().hasSession) {
      const timeout = new Promise((resolve) => setTimeout(resolve, SAVE_TIMEOUT_MS));
      await Promise.race([updateMe({ lang: next }).catch(() => undefined), timeout]);
    }
    const { pathname, search, hash } = window.location;
    window.location.assign(localePath(next, splitLocale(pathname).path) + search + hash);
  };

  return { lang, setLang };
};
