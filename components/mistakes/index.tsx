"use client";

import { useTranslation } from "react-i18next";
import { QuestionList } from "@/components/question-list";
import { ReviewCard } from "@/components/review";
import { reviewWhen } from "@/components/review/when";
import { useMistakesQuery } from "@/hooks/useQuery";
import { useRemoveMistakeMutation } from "@/request/mutation";

// /mistakes — xato qilingan savollar. Aqlli takrorlash: savol 1, 3, 7 kundan keyin vaqtida 3 marta to'g'ri
// topilsa o'rganiladi va ro'yxatdan chiqadi. Kartada bosqich (1/3) va keyingi takrorlash vaqti
export const Mistakes = () => {
  const { t } = useTranslation();
  const query = useMistakesQuery();
  const remove = useRemoveMistakeMutation();
  return (
    <QuestionList
      kind="mistakes"
      query={query}
      header={<ReviewCard />}
      meta={(item) =>
        [
          t("mistakes.wrongCount", { count: item.wrongCount }),
          t("review.step", { step: item.reviewStep, total: item.reviewSteps }),
          item.dueAt &&
            (new Date(item.dueAt).getTime() <= Date.now()
              ? t("review.dueReady")
              : t("review.nextAt", { when: reviewWhen(item.dueAt, t) })),
        ]
          .filter(Boolean)
          .join(" · ")
      }
      myAnswerId={(item) => item.myAnswerId}
      onRemove={(id) => remove.mutate(id)}
    />
  );
};
