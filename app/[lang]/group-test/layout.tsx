import type { Metadata } from "next";
import { createServerI18n, toLanguage } from "@/i18n";

// Metadata layout'da: bu segmentda faqat `lang` bor (generateStaticParams bilan oldindan ma'lum),
// sahifadagi dinamik id o'qilmaydi, shuning uchun sahifa prefetch'i bloklanmaydi
export async function generateMetadata({ params }: LayoutProps<"/[lang]/group-test">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.groupTest"), robots: { index: false } };
}

export default function Layout({ children }: LayoutProps<"/[lang]/group-test">) {
  return children;
}
