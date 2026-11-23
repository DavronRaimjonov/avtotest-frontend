import { create } from "zustand";
import type { PlanFeature } from "@/@types";

// "Bu bo'lim tarif bilan ochiladi" oynasi. PREMIUM_REQUIRED xatosi (request/index.ts) yoki
// qulflangan elementni bosganda ochiladi; feature — qaysi imkoniyat uchun (matn shunga qarab)
interface PaywallState {
  open: boolean;
  feature: PlanFeature | null;
  openPaywall: (feature?: PlanFeature | null) => void;
  closePaywall: () => void;
}

export const usePaywallStore = create<PaywallState>((set) => ({
  open: false,
  feature: null,
  openPaywall: (feature = null) => set({ open: true, feature }),
  closePaywall: () => set({ open: false }),
}));
