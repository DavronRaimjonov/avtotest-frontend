"use client";

import { useTranslation } from "react-i18next";
import { PaymentHistory } from "@/components/billing/payment-history";
import { ReviewCard } from "@/components/review";
import { useMeQuery } from "@/hooks/useQuery";
import { ProfileHistory } from "./history";
import { PlanCard } from "./plan-card";
import { ProfileCard } from "./profile-card";
import { ReadinessCard } from "./readiness";
import { ProfileStats } from "./stats";

// /profile — kabinet (faqat kirganlarga, proxy). Chapda profil va tarif, o'ngda tayyorlik foizi, aqlli takrorlash,
// statistika, tarix va to'lovlar.
// Keng ekranda chap ustun aylantirganda qotib turadi
export const Profile = () => {
  const { t } = useTranslation();
  const { data: me, isPending, isError, refetch } = useMeQuery();

  if (isError) {
    return (
      <div className="mx-auto flex max-w-300 flex-col items-start gap-3 px-4 py-20 sm:px-6">
        <p className="m-0 text-muted">{t("profile.loadError")}</p>
        <button type="button" onClick={() => refetch()} className="h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white">
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 lg:flex-row lg:items-start lg:pt-10">
      <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-90 lg:flex-none">
        {isPending || !me ? <span className="h-80 animate-pulse rounded-3xl bg-soft" /> : <ProfileCard me={me} />}
        <PlanCard />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ReadinessCard />
        <ReviewCard />
        <ProfileStats />
        <ProfileHistory />
        <PaymentHistory />
      </div>
    </div>
  );
};
