import { Suspense } from "react";
import { Result, ResultSkeleton } from "@/components/result";

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <Result />
    </Suspense>
  );
}
