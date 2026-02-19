import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'UIDT IMPRESSION',
  description:
    "Plateforme d'impression de documents en ligne. Uploadez votre PDF, choisissez vos options de finition et recevez votre document imprimé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-white min-h-screen font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
