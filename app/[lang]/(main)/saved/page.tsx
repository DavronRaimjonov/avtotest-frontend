import type { Metadata } from "next";
import { Saved } from "@/components/saved";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/saved">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.saved"), robots: { index: false } };
}

// Faqat kirganlarga: ro'yxat brauzerda (token bilan) olinadi
export default function SavedPage() {
  return <Saved />;
}
