import type { Metadata } from "next";
import { createServerI18n, toLanguage } from "@/i18n";

// Metadata layout'da: bu segmentda faqat `lang` bor — /cheat-sheets/[slug] dagi dinamik slug o'qilmaydi,
// shuning uchun sahifa prefetch'i bloklanmaydi
export async function generateMetadata({ params }: LayoutProps<"/[lang]/cheat-sheets">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("cheatSheets.title"), description: t("cheatSheets.subtitle") };
}

export default function Layout({ children }: LayoutProps<"/[lang]/cheat-sheets">) {
  return children;
}
