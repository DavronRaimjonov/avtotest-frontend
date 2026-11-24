import type { TFunction } from "i18next";
import { dayDiff, formatClock } from "@/lib/helpers";

// Keyingi takrorlash vaqti: "takrorlash vaqti keldi" · "bugun 18:00" · "ertaga 10:06" · "3 kundan keyin"
export const reviewWhen = (iso: string, t: TFunction) => {
  if (new Date(iso).getTime() <= Date.now()) return t("review.dueReady");
  const days = dayDiff(iso);
  if (days <= 0) return t("review.dueToday", { time: formatClock(iso) });
  if (days === 1) return t("review.dueTomorrow", { time: formatClock(iso) });
  return t("review.dueInDays", { count: days });
};
