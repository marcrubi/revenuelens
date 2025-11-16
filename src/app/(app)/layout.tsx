// src/app/(app)/layout.tsx

export default function AppGroupLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* aquí luego metes sidebar/topbar */}
            {children}
        </main>
    );
}
