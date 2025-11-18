// src/app/(marketing)/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'RevenueLens',
    description: 'Understand your sales. Predict your revenue.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body
            className={`${inter.variable} font-sans bg-background text-foreground antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
