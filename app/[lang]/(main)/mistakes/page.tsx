import type { Metadata } from "next";
import { Mistakes } from "@/components/mistakes";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/mistakes">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.mistakes"), robots: { index: false } };
}

// Faqat kirganlarga: ro'yxat brauzerda (token bilan) olinadi
export default function MistakesPage() {
  return <Mistakes />;
}
