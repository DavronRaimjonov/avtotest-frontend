"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth.store";

// "Kodni qayta yuborish" — 60 soniyalik teskari sanoq bilan (resendAt store'da)
export const ResendCode = ({ onResend, pending }: { onResend: () => void; pending: boolean }) => {
  const { t } = useTranslation();
  const resendAt = useAuthStore((s) => s.resendAt);
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={left > 0 || pending}
      className="self-center text-sm font-bold text-navy-2 disabled:font-semibold disabled:text-muted"
    >
      {left > 0 ? t("auth.resendIn", { sec: left }) : t("auth.resend")}
    </button>
  );
};
