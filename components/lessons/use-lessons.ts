"use client";

import { useMemo } from "react";
import { useAccess } from "@/hooks/useAccess";
import { useStatsQuery, useTopicsQuery } from "@/hooks/useQuery";
import { buildLessons, FREE_LESSON_TOPIC } from "@/lib/lessons";

// Darslar + har bir mavzu holati: ochiq/yopiq (tarifdagi "videos" yoki bepul namuna) va
// o'tilganmi (kirgan foydalanuvchida /me/stats dagi mavzu bo'yicha javoblar soni > 0)
export const useLessons = () => {
  const topics = useTopicsQuery();
  const { data: stats } = useStatsQuery();
  const { has } = useAccess();
  const canWatch = has("videos");

  const lessons = useMemo(() => {
    const answered = new Map(stats?.topics.map((x) => [x.id, x.answered]) ?? []);
    return buildLessons(topics.data ?? []).map((l) => {
      const items = l.topics.map((topic) => ({
        topic,
        open: canWatch || topic.slug === FREE_LESSON_TOPIC,
        done: (answered.get(topic.id) ?? 0) > 0,
      }));
      return {
        ...l,
        items,
        done: items.filter((i) => i.done).length,
        locked: items.every((i) => !i.open),
      };
    });
  }, [topics.data, stats, canWatch]);

  return { lessons, isPending: topics.isPending, isError: topics.isError, refetch: topics.refetch };
};

export type LessonState = ReturnType<typeof useLessons>["lessons"][number];
