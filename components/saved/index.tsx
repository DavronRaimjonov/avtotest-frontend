"use client";

import { useTranslation } from "react-i18next";
import { QuestionList } from "@/components/question-list";
import { useBookmarksQuery } from "@/hooks/useQuery";
import { useRemoveBookmarkMutation } from "@/request/mutation";

// /saved — test paytida "Saqlash" bosilgan savollar
export const Saved = () => {
  const { t } = useTranslation();
  const query = useBookmarksQuery();
  const remove = useRemoveBookmarkMutation();
  return (
    <QuestionList
      kind="saved"
      query={query}
      meta={(item, date) => t("saved.savedAt", { date: date(item.savedAt) })}
      onRemove={(id) => remove.mutate(id)}
    />
  );
};
