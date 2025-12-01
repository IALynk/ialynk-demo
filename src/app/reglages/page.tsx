export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import ReglagesContent from "./ReglagesContent";

export default function ReglagesPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ReglagesContent />
    </Suspense>
  );
}
