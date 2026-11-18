import { create } from "zustand";
import type { ExamMode, VariantSize } from "@/@types";

interface ExamState {
  // Variantlar sahifasidagi tanlov. selectedVariantId — variant id (number emas). Test tili — ilova tili (hooks/useLang)
  size: VariantSize;
  selectedVariantId: number | null;
  mode: ExamMode;
  setSize: (size: VariantSize) => void;
  setSelectedVariantId: (id: number) => void;
  setMode: (mode: ExamMode) => void;

  // Ochiq testdagi joriy savol (savollar va javoblar react-query keshida)
  current: number;
  goTo: (index: number, total: number) => void;
  resetCurrent: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  size: 20,
  selectedVariantId: null,
  mode: "practice",
  setSize: (size) => set({ size, selectedVariantId: null }),
  setSelectedVariantId: (selectedVariantId) => set({ selectedVariantId }),
  setMode: (mode) => set({ mode }),

  current: 0,
  goTo: (index, total) => set({ current: Math.min(Math.max(index, 0), Math.max(total - 1, 0)) }),
  resetCurrent: () => set({ current: 0 }),
}));
