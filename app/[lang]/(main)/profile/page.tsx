import type { Metadata } from "next";
import { Profile } from "@/components/profile";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/profile">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.profile"), robots: { index: false } };
}

// Faqat kirganlarga (proxy): ma'lumotlar brauzerda token bilan olinadi
export default function ProfilePage() {
  return <Profile />;
}
