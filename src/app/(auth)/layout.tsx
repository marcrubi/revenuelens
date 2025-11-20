// src/app/(auth)/layout.tsx

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-300">
                {children}
            </div>
        </main>
    );
}
