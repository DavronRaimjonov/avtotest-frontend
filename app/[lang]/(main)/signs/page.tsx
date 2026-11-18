import type { Metadata } from "next";
import { SignGroups } from "@/components/signs";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/signs">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.signs") };
}

// Kategoriyalar va qidiruv brauzerda olinadi
export default function Page() {
  return <SignGroups />;
}
