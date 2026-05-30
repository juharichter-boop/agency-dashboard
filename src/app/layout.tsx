import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agency Operations Dashboard',
  description: 'Internal analytics platform for agency operations',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
