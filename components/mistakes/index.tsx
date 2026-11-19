"use client";

import { useTranslation } from "react-i18next";
import { QuestionList } from "@/components/question-list";
import { useMistakesQuery } from "@/hooks/useQuery";
import { useRemoveMistakeMutation } from "@/request/mutation";

// /mistakes — xato qilingan savollar. To'g'ri yechilgan savol ro'yxatdan o'zi chiqadi
export const Mistakes = () => {
  const { t } = useTranslation();
  const query = useMistakesQuery();
  const remove = useRemoveMistakeMutation();
  return (
    <QuestionList
      kind="mistakes"
      query={query}
      meta={(item, date) =>
        `${t("mistakes.wrongCount", { count: item.wrongCount })} · ${t("mistakes.lastWrongAt", { date: date(item.lastWrongAt) })}`
      }
      myAnswerId={(item) => item.myAnswerId}
      onRemove={(id) => remove.mutate(id)}
    />
  );
};
