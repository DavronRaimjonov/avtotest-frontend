import { Suspense } from "react";
import { Lessons } from "@/components/lessons";

// Darslar brauzerda mavzulardan tuziladi (?lesson= — useSearchParams, shuning uchun Suspense). Metadata — layout'da
export default function LessonsPage() {
  return (
    <Suspense>
      <Lessons />
    </Suspense>
  );
}
