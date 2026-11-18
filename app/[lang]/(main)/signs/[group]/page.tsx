import type { Metadata } from "next";
import { Suspense } from "react";
import { SignGroupView } from "@/components/signs/group";
import { createServerI18n, toLanguage } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/signs/[group]">): Promise<Metadata> {
  const { t } = createServerI18n(toLanguage((await params).lang));
  return { title: t("meta.signs") };
}

// Ma'lumot brauzerda olinadi (useParams — Suspense ichida)
export default function Page() {
  return (
    <Suspense>
      <SignGroupView />
    </Suspense>
  );
}
