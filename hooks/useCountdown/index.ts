"use client";

import { useEffect, useState } from "react";

// Qolgan soniya. deadline — Date.now() ms (null bo'lsa taymer yo'q — mashq rejimi).
// Har soniyada joriy vaqtdan hisoblanadi: vkladka uxlab qolsa ham to'g'ri chiqadi
export const useCountdown = (deadline: number | null | undefined) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline == null) return;
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  return deadline == null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
};
