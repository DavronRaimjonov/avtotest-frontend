import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerI18n, toLanguage } from "@/i18n";
import { TestRunner, TestSkeleton } from "@/components/test";

export async function generateMetadata({ params }: PageProps<"/[lang]/test/[attemptId]">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.test"), robots: { index: false } };
}

// Test to'liq brauzerda ishlaydi: params va searchParams client'da o'qiladi
export default function TestPage() {
  return (
    <Suspense fallback={<TestSkeleton />}>
      <TestRunner />
    </Suspense>
  );
}
