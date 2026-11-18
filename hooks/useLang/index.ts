"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { TestLang } from "@/@types";
import { toLanguage } from "@/i18n";
import { QUERY_KEYS } from "@/lib/query-keys";
import { localePath, splitLocale } from "@/lib/routes";
import { updateMe } from "@/request/user";
import { useAuthStore } from "@/store/auth.store";

// Ilova tili URL'dan: / (uzb), /uzc/..., /ru/... Interfeys matnlari va API'dagi ?lang= (test tili) bir xil.
// Til almashtirish — shu sahifaning boshqa tildagi manziliga o'tish; kirgan foydalanuvchida profilga ham yoziladi
export const useLang = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lang = toLanguage(i18n.language);

  const setLang = (next: TestLang) => {
    if (next === lang) return;
    // Ochiq test va natija yangi tilda qayta olinadi (topics, demo-question kalitida til bor)
    queryClient.invalidateQueries({ queryKey: ["attempts"] });
    // Joriy yo'l bosilganda o'qiladi (usePathname header'ni prerender'da bloklab qo'yardi)
    const { pathname, search, hash } = window.location;
    router.push(localePath(next, splitLocale(pathname).path) + search + hash);
    if (useAuthStore.getState().hasSession) {
      updateMe({ lang: next })
        .then((me) => queryClient.setQueryData(QUERY_KEYS.me, me))
        .catch(() => undefined);
    }
  };

  return { lang, setLang };
};
