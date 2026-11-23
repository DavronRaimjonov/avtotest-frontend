import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupJoin } from "@/components/group-test/join";
import { createServerI18n, toLanguage } from "@/i18n";
import { GROUP_TESTS_ENABLED } from "@/lib/constants";

export async function generateMetadata({ params }: PageProps<"/[lang]/group-test">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.groupTest"), robots: { index: false } };
}

// Kod kiritish va mening jamoaviy testlarim: ro'yxat brauzerda (token bilan) olinadi
export default function GroupTestsPage() {
  if (!GROUP_TESTS_ENABLED) notFound();
  return <GroupJoin />;
}
