import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/billing/payment-result";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/payment/result">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.payment"), robots: { index: false } };
}

// Faqat kirganlarga (proxy): buyurtma holati token bilan so'raladi
export default function PaymentResultPage() {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
}
