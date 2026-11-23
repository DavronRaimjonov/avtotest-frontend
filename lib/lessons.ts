import type { Topic } from "@/@types";

// Darslik: backendda darslar API'si hali yo'q — darslar mavjud mavzulardan (GET /topics) tuziladi.
// Har bir dars — mavzular slug'lari ro'yxati (tartib bilan). Bu yerda yo'q yangi mavzu oxirgi darsga qo'shiladi.
// Videodarslar tayyor bo'lganda backenddan keladigan ro'yxat bilan almashtiriladi
export const LESSON_TOPICS: string[][] = [
  ["umumiy-qoidalar", "haydovchi-majburiyatlari"],
  ["svetofor", "yol-belgilari", "yol-chiziqlari"],
  ["tezlik", "quvib-otish", "chorrahalar"],
  ["piyodalar", "temir-yol", "toxtash"],
  ["yoritish", "tashish", "nosozliklar"],
  ["tibbiy-yordam", "javobgarlik"],
];

// Tarifsiz ham ochiq: birinchi darsning birinchi mavzusi (namuna). Qolgani "videos" imkoniyati bilan
export const FREE_LESSON_TOPIC = LESSON_TOPICS[0][0];

export interface Lesson {
  number: number;
  topics: Topic[];
}

export const buildLessons = (topics: Topic[]): Lesson[] => {
  const bySlug = new Map(topics.map((t) => [t.slug, t]));
  const used = new Set<string>();
  const lessons = LESSON_TOPICS.map((slugs) =>
    slugs.flatMap((slug) => {
      const topic = bySlug.get(slug);
      if (!topic) return [];
      used.add(slug);
      return [topic];
    }),
  );
  const rest = topics.filter((t) => !used.has(t.slug));
  if (rest.length) lessons.push(rest);
  return lessons.filter((l) => l.length).map((l, i) => ({ number: i + 1, topics: l }));
};
