// src/app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Este layout solo envuelve el contenido, ya hereda html/body del Root */}
      {children}
    </div>
  );
}
