import { create } from "zustand";

// Kirish oynasidagi bosqichlar: login ↔ register → verify (emailga kod), forgot → reset, change (kirganda parol almashtirish)
export type AuthView = "login" | "register" | "verify" | "forgot" | "reset" | "change";

interface AuthState {
  // Cookie'da token bormi. Serverda va birinchi renderda false —
  // provider mount bo'lgach cookie'dan o'qib qo'yadi, shunda hydration mos keladi
  hasSession: boolean;
  setHasSession: (hasSession: boolean) => void;

  // Kirish oynasi. afterLogin — kirgandan keyin bajariladigan amal (masalan, testni boshlash)
  loginOpen: boolean;
  view: AuthView;
  // verify / reset bosqichlari uchun email va "Qayta yuborish" ochiladigan vaqt (Date.now() ms)
  email: string;
  resendAt: number;
  afterLogin: (() => void) | null;
  openLogin: (afterLogin?: () => void, view?: AuthView, email?: string) => void;
  setView: (view: AuthView, patch?: { email?: string; resendInSec?: number }) => void;
  setResendIn: (sec: number) => void;
  closeLogin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hasSession: false,
  setHasSession: (hasSession) => set({ hasSession }),

  loginOpen: false,
  view: "login",
  email: "",
  resendAt: 0,
  afterLogin: null,
  openLogin: (afterLogin, view = "login", email = "") =>
    set({ loginOpen: true, view, email, afterLogin: afterLogin ?? null }),
  setView: (view, patch) =>
    set((s) => ({
      view,
      email: patch?.email ?? s.email,
      resendAt: patch?.resendInSec !== undefined ? Date.now() + patch.resendInSec * 1000 : s.resendAt,
    })),
  setResendIn: (sec) => set({ resendAt: Date.now() + sec * 1000 }),
  closeLogin: () => set({ loginOpen: false, afterLogin: null, view: "login" }),
}));
