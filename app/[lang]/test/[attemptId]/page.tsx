import { Suspense } from "react";
import { TestRunner, TestSkeleton } from "@/components/test";

// Test to'liq brauzerda ishlaydi: params va searchParams client'da o'qiladi
export default function TestPage() {
  return (
    <Suspense fallback={<TestSkeleton />}>
      <TestRunner />
    </Suspense>
  );
}
