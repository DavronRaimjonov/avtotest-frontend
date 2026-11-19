"use client";

import { isServer, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "sonner";
import type { TestLang } from "@/@types";
import { LoginModal } from "@/components/auth/login-modal";
import i18next, { createServerI18n, LOCALE_CODES } from "@/i18n";
import { getQueryClient } from "@/lib/query-client";
import { hasAuthTokens } from "@/request/token";
import { useAuthStore } from "@/store/auth.store";

export default function ProviderApi({ lang, children }: { lang: TestLang; children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // lang — URL'dan (app/[lang]/layout). Serverda har so'rovga alohida instance, brauzerda yagona
  const [i18n] = useState(() => {
    if (isServer) return createServerI18n(lang);
    if (i18next.language !== LOCALE_CODES[lang]) i18next.changeLanguage(LOCALE_CODES[lang]);
    return i18next;
  });

  // Sessiya bor-yo'qligi mount'dan keyin cookie'dan o'qiladi.
  // Vkladkaga qaytilganda ham — boshqa vkladkada kirilgan yoki chiqilgan bo'lishi mumkin
  useEffect(() => {
    const sync = () => useAuthStore.getState().setHasSession(hasAuthTokens());
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {children}
        <LoginModal />
        {/* Header (sticky) ustida emas, ostida chiqadi */}
        <Toaster position="top-center" richColors closeButton offset={84} mobileOffset={{ top: 72 }} duration={4000} />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
