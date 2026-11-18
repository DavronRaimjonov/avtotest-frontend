import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerI18n, toLanguage } from "@/i18n";
import { Result, ResultSkeleton } from "@/components/result";

export async function generateMetadata({ params }: PageProps<"/[lang]/result/[attemptId]">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.result"), robots: { index: false } };
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <Result />
    </Suspense>
  );
}
