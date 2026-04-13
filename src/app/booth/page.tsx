import { Suspense } from "react";
import { BoothApp } from "@/components/booth/BoothApp";

export default function BoothPage() {
  return (
    <Suspense
      fallback={
        <div className="booth-root flex min-h-dvh items-center justify-center text-sm text-[var(--booth-walnut)]">
          Loading booth…
        </div>
      }
    >
      <BoothApp />
    </Suspense>
  );
}
