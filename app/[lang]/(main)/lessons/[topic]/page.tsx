import { Suspense } from "react";
import { LessonView } from "@/components/lessons/lesson-view";

// Ma'lumot brauzerda olinadi (useParams — Suspense ichida). Metadata — lessons/layout.tsx da
export default function LessonPage() {
  return (
    <Suspense>
      <LessonView />
    </Suspense>
  );
}
