"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toLanguage } from "@/i18n";
import { notify } from "@/generics/notification";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";

// Google Identity Services'ning kerakli qismi
type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (res: { credential: string }) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (el: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

// initialize sahifada bir marta chaqiriladi; credential esa joriy ochiq tugmaga yetkaziladi
let initialized = false;
let onCredential: ((credential: string) => void) | null = null;

type Props = {
  onSuccess: (idToken: string) => void;
  // signin — "Google bilan kirish", signup — "Google bilan ro'yxatdan o'tish" (backend uchun farqi yo'q:
  // akkaunt bo'lmasa yaratiladi, shu email bilan bo'lsa unga ulanadi)
  intent?: "signin" | "signup";
  width?: number;
};

export const GoogleButton = ({ onSuccess, intent = "signin", width = 320 }: Props) => {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Google tugmasi matni ham tanlangan tilda (kirill o'zbekchani Google qo'llamaydi — rus/o'zbek)
  const locale = toLanguage(i18n.language) === "ru" ? "ru" : "uz";

  useEffect(() => {
    onCredential = onSuccess;
    return () => {
      if (onCredential === onSuccess) onCredential = null;
    };
  }, [onSuccess]);

  useEffect(() => {
    const gid = window.google?.accounts.id;
    if (!ready || !gid || !ref.current || !GOOGLE_CLIENT_ID) return;
    if (!initialized) {
      gid.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => onCredential?.(credential),
        ux_mode: "popup",
      });
      initialized = true;
    }
    gid.renderButton(ref.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: intent === "signup" ? "signup_with" : "signin_with",
      shape: "pill",
      logo_alignment: "left",
      locale,
      width,
    });
  }, [ready, width, locale, intent]);

  // Client ID hali berilmagan (.env.local → NEXT_PUBLIC_GOOGLE_CLIENT_ID): tugma ko'rinadi, bosilganda xabar.
  // ID qo'yilgach shu joyda Google'ning o'z tugmasi chiqadi
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() => notify(t("auth.googleSoon"), "info")}
        style={{ width }}
        className="flex h-11 max-w-full items-center justify-center gap-3 rounded-full border border-[#DADCE0] bg-white px-4 text-sm font-semibold text-[#3C4043] hover:bg-[#F8FAFF]"
      >
        <GoogleLogo />
        {t(intent === "signup" ? "auth.googleSignup" : "auth.googleSignin")}
      </button>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={ref} className="flex min-h-11 justify-center" style={{ width }}>
        {!ready && <span className="h-11 w-full animate-pulse rounded-full bg-soft" />}
      </div>
    </>
  );
};

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);
