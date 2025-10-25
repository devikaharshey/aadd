import React, { Suspense } from "react";
import VerifyPageContent from "@/components/app-components/VerifyPageContent";

export default function VerifyPagePage() {
  return (
    <Suspense
      fallback={<p className="text-center mt-20">Loading verification...</p>}
    >
      <VerifyPageContent />
    </Suspense>
  );
}
