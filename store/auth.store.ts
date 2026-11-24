import { create } from "zustand";
import type { TelegramPending } from "@/@types";

// Kirish oynasidagi bosqichlar: login (Telegram tugmasi + telefon/parol) → telegram (bot orqali) → setPassword
// (yangi ro'yxatdan o'tganga majburiy "Parol yarating" yoki eski parolsiz akkauntga set-password), forgot → reset (kod Telegram botga), change (parolni almashtirish), telegramLink (profilga ulash)
export type AuthView = "login" | "forgot" | "reset" | "change" | "telegram" | "telegramLink" | "setPassword";

interface AuthState {
  // Cookie'da token bormi. Serverda va birinchi renderda false —
  // provider mount bo'lgach cookie'dan o'qib qo'yadi, shunda hydration mos keladi
  hasSession: boolean;
  setHasSession: (hasSession: boolean) => void;

  // Kirish oynasi. afterLogin — kirgandan keyin bajariladigan amal (masalan, testni boshlash)
  loginOpen: boolean;
  view: AuthView;
  // forgot / reset bosqichlari uchun telefon va "Qayta yuborish" ochiladigan vaqt (Date.now() ms)
  phone: string;
  resendAt: number;
  afterLogin: (() => void) | null;
  openLogin: (afterLogin?: () => void, view?: AuthView) => void;
  setView: (view: AuthView, patch?: { phone?: string; resendInSec?: number }) => void;
  closeLogin: () => void;
  // Oyna yopiladi va kirishdan oldin so'ralgan amal bajariladi ("Parol yarating" qadamidan keyin)
  finishLogin: () => void;
  // Telegram tasdiqladi, lekin parol yo'q (status=password_required): "Parol yarating" → telegram/complete.
  // null — oddiy set-password (kirgan, paroli yo'q foydalanuvchi)
  telegramPending: TelegramPending | null;
  askTelegramPassword: (pending: TelegramPending) => void;
  // Serverda Telegram bot sozlanmagan (503 TELEGRAM_AUTH_DISABLED) — tugma o'rniga ogohlantirish
  telegramOff: boolean;
  setTelegramOff: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hasSession: false,
  setHasSession: (hasSession) => set({ hasSession }),

  loginOpen: false,
  view: "login",
  phone: "",
  resendAt: 0,
  afterLogin: null,
  openLogin: (afterLogin, view = "login") => set({ loginOpen: true, view, afterLogin: afterLogin ?? null }),
  setView: (view, patch) =>
    set((s) => ({
      view,
      phone: patch?.phone ?? s.phone,
      resendAt: patch?.resendInSec !== undefined ? Date.now() + patch.resendInSec * 1000 : s.resendAt,
    })),
  closeLogin: () => set({ loginOpen: false, afterLogin: null, view: "login", telegramPending: null }),
  finishLogin: () => {
    const { afterLogin } = get();
    set({ loginOpen: false, afterLogin: null, view: "login", telegramPending: null });
    afterLogin?.();
  },
  telegramPending: null,
  askTelegramPassword: (telegramPending) => set({ telegramPending, view: "setPassword" }),
  telegramOff: false,
  setTelegramOff: () => set({ telegramOff: true }),
}));
