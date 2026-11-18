import type { Metadata } from "next";
import { Variants } from "@/components/variants";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/variants">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.variants") };
}

export default function VariantsPage() {
  return <Variants />;
}
