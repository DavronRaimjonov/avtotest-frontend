"use client";

import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TelegramStart } from "@/@types";
import { TelegramIcon } from "@/components/ui/icons";
import { notify, notifyApiError } from "@/generics/notification";
import { currentLang } from "@/i18n";
import { formatTime, getErrorCode } from "@/lib/helpers";
import { QUERY_KEYS } from "@/lib/query-keys";
import { telegramStart, telegramStatus } from "@/request/auth";
import { completeAuth } from "@/request/mutation";
import { linkTelegram } from "@/request/user";
import { useAuthStore } from "@/store/auth.store";

const POLL_MS = 2000;

type Phase = "loading" | "pending" | "rejected" | "expired";

// Telefon/planshet: botni darhol ochamiz; kompyuterda QR kod (telefon kamerasi bilan)
const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

// Telegram orqali kirish (purpose="login") yoki profilga ulash ("link"). FRONTEND-API.md: Telegram orqali kirish.
// start → ekranda 2 xonali raqam + bot havolasi / QR → har 2 soniyada status →
// confirmed (tokenlar) / password_required ("Parol yarating" → telegram/complete) / linked
export const TelegramView = ({ purpose }: { purpose: "login" | "link" }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setView = useAuthStore((s) => s.setView);
  const [req, setReq] = useState<TelegramStart | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [now, setNow] = useState(() => Date.now());
  // Oyna faqat brauzerda ochiladi — hydration muammosi yo'q
  const [touch] = useState(isTouch);
  const started = useRef(false);

  const start = useCallback(async () => {
    setPhase("loading");
    setReq(null);
    try {
      const res = purpose === "login" ? await telegramStart(currentLang()) : await linkTelegram();
      setReq(res);
      setPhase("pending");
      setNow(Date.now());
      // Mobilda bot yangi oynada ochiladi (brauzer bloklasa — "Telegram'ni ochish" tugmasi bor)
      if (touch) window.open(res.botUrl, "_blank", "noopener");
    } catch (error) {
      // Serverda bot sozlanmagan — tugma yashiriladi, oddiy kirishga qaytamiz
      if (getErrorCode(error) === "TELEGRAM_AUTH_DISABLED") useAuthStore.getState().setTelegramOff();
      notifyApiError(error);
      if (purpose === "login") setView("login");
      else useAuthStore.getState().closeLogin();
    }
  }, [purpose, setView, touch]);

  useEffect(() => {
    // Ochilganda bir marta so'rov yaratiladi (StrictMode'dagi ikkinchi chaqiruvda ham)
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  // Holatni kutish: har 2 soniyada so'raladi, yakuniy holatda to'xtaydi
  useEffect(() => {
    if (phase !== "pending" || !req) return;
    let stopped = false;
    const tick = async () => {
      setNow(Date.now());
      try {
        const res = await telegramStatus(req.token);
        if (stopped) return;
        switch (res.status) {
          case "pending":
            return;
          case "password_required":
            // Yangi ro'yxatdan o'tgan (yoki parolsiz akkaunt): token parol yaratilgandan keyin beriladi
            stopped = true;
            useAuthStore.getState().askTelegramPassword({ token: req.token, isNew: res.isNew, firstName: res.firstName });
            return;
          case "confirmed":
            stopped = true;
            completeAuth(queryClient, res);
            return;
          case "linked":
            stopped = true;
            queryClient.setQueryData(QUERY_KEYS.me, res.user);
            notify(t("profile.telegram.linked"));
            useAuthStore.getState().closeLogin();
            return;
          case "used":
            // Tokenlarni boshqa tab olgan — bu yerda kutish ma'nosiz
            stopped = true;
            setPhase("expired");
            return;
          default:
            stopped = true;
            setPhase(res.status);
        }
      } catch (error) {
        if (stopped) return;
        // Tarmoq uzilishi — keyingi urinishda davom etadi; 404 / bloklangan — to'xtaymiz
        if (getErrorCode(error)) {
          stopped = true;
          notifyApiError(error);
          setPhase("expired");
        }
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [phase, req, queryClient, t]);

  if (phase === "rejected" || phase === "expired") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <p className="m-0 text-[15px] leading-relaxed text-slate">
          {t(phase === "rejected" ? "auth.telegram.rejected" : "auth.telegram.expired")}
        </p>
        <button
          type="button"
          onClick={start}
          className="btn-hover h-12 w-full rounded-xl bg-[#229ED9] font-extrabold text-white"
        >
          {t("auth.telegram.retry")}
        </button>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="h-20 w-28 animate-pulse rounded-2xl bg-soft" />
        <span className="h-4 w-48 animate-pulse rounded bg-soft" />
      </div>
    );
  }

  const left = Math.max(0, (new Date(req.expiresAt).getTime() - now) / 1000);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="m-0 text-[15px] leading-relaxed text-slate">{t("auth.telegram.pickCode")}</p>
      <b className="rounded-2xl bg-bg px-8 py-3 text-[56px] leading-none font-extrabold tracking-wider text-navy tabular-nums">
        {String(req.code).padStart(2, "0")}
      </b>

      {/* Kompyuterda QR (telefon kamerasi bilan), mobilda faqat tugma */}
      {!touch && (
        <div className="flex flex-col items-center gap-2">
          <span className="rounded-2xl border border-line bg-white p-3">
            <QRCodeSVG value={req.botUrl} size={168} marginSize={0} />
          </span>
          <span className="text-[13px] text-muted">{t("auth.telegram.scanQr")}</span>
        </div>
      )}

      <a
        href={req.botUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] font-extrabold text-white"
      >
        <TelegramIcon size={20} />
        {t("auth.telegram.openApp")}
      </a>

      <span className="flex items-center gap-2 text-[13px] font-semibold text-muted">
        <span className="size-2 animate-pulse rounded-full bg-[#229ED9]" />
        {t("auth.telegram.waiting")} · {formatTime(left)}
      </span>
    </div>
  );
};
