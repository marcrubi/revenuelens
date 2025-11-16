// src/app/(auth)/layout.tsx

export default function AuthGroupLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
            {children}
        </main>
    );
}
