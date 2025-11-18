// src/app/(marketing)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevenueLens",
  description: "Understand your sales. Predict your revenue.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El root layout ya se encarga de html/body, fuente y colores.
  return <div className="min-h-screen">{children}</div>;
}
