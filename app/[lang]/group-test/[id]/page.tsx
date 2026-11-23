import { Suspense } from "react";
import { GroupTestRunner, GroupTestSkeleton } from "@/components/group-test";

// Lobby, test va natija to'liq brauzerda (socket bilan): params client'da o'qiladi
export default function GroupTestPage() {
  return (
    <Suspense fallback={<GroupTestSkeleton />}>
      <GroupTestRunner />
    </Suspense>
  );
}
