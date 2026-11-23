import type { Metadata } from "next";
import { Suspense } from "react";
import { Pricing } from "@/components/billing/pricing";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.pricing"), description: t("meta.pricingDescription") };
}

// Tariflar brauzerda olinadi (?plan= — useSearchParams, shuning uchun Suspense)
export default function PricingPage() {
  return (
    <Suspense>
      <Pricing />
    </Suspense>
  );
}
