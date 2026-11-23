import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerI18n, toLanguage } from "@/i18n";
import { GROUP_TESTS_ENABLED } from "@/lib/constants";

// Metadata layout'da: bu segmentda faqat `lang` bor (generateStaticParams bilan oldindan ma'lum),
// sahifadagi dinamik id o'qilmaydi, shuning uchun sahifa prefetch'i bloklanmaydi
export async function generateMetadata({ params }: LayoutProps<"/[lang]/group-test">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.groupTest"), robots: { index: false } };
}

// Jamoaviy test backendda o'chiq bo'lsa sahifa ham yo'q (404)
export default function Layout({ children }: LayoutProps<"/[lang]/group-test">) {
  if (!GROUP_TESTS_ENABLED) notFound();
  return children;
}
