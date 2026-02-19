import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imp.innosft.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'UIDT Impression | InnoSoft – Impression de documents en ligne',
    template: '%s | UIDT Impression',
  },
  description:
    "UIDT Impression par InnoSoft : plateforme d'impression de documents en ligne. Uploadez votre PDF ou Word, choisissez vos finitions (reliure spirale, livre) et recevez votre document imprimé. Service rapide et professionnel.",
  keywords: [
    'UIDT impression',
    'InnoSoft impression',
    'innosoft impression',
    'impression document en ligne',
    'impression PDF Dakar',
    'impression UIDT',
    'impression université',
    'reliure spirale',
    'impression mémoire',
    'impression rapport',
  ],
  authors: [{ name: 'InnoSoft Creation', url: SITE_URL }],
  creator: 'InnoSoft Creation',
  publisher: 'InnoSoft Creation',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'UIDT Impression',
    title: 'UIDT Impression | InnoSoft – Impression de documents en ligne',
    description:
      "Plateforme d'impression de documents en ligne. Uploadez votre PDF, choisissez vos finitions et recevez votre document imprimé.",
    images: [{ url: '/finitions/INNOSOFT.png', width: 400, height: 120, alt: 'InnoSoft - UIDT Impression' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UIDT Impression | InnoSoft',
    description: "Impression de documents en ligne – PDF, Word, reliure spirale, format livre.",
  },
  icons: {
    icon: '/finitions/INNOSOFT.png',
    apple: '/finitions/INNOSOFT.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  alternates: { canonical: SITE_URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'UIDT Impression',
  alternateName: ['InnoSoft Impression', 'Impression UIDT'],
  url: SITE_URL,
  description:
    "Plateforme d'impression de documents en ligne par InnoSoft. Impression PDF, Word, reliure spirale, format livre.",
  publisher: {
    '@type': 'Organization',
    name: 'InnoSoft Creation',
    url: SITE_URL,
    logo: `${SITE_URL}/finitions/INNOSOFT.png`,
  },
  inLanguage: 'fr-FR',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-white min-h-screen font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
