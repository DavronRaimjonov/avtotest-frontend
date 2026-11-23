import { Suspense } from "react";
import { CheatSheetView } from "@/components/cheat-sheets/sheet";

// Ma'lumot brauzerda olinadi (useParams — Suspense ichida). Metadata — cheat-sheets/layout.tsx da
export default function CheatSheetPage() {
  return (
    <Suspense>
      <CheatSheetView />
    </Suspense>
  );
}
