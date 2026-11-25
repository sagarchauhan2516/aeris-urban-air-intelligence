import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AERIS — Urban Air Quality & Exposure Intelligence Portal',
  description:
    'Real-time India NAQI telemetry, household exposure risk assessment, indoor ventilation windows, and commute guidance.',
  openGraph: {
    title: 'AERIS — Urban Air Quality & Exposure Intelligence Portal',
    description:
      'Live India CPCB NAQI monitoring, personalized household exposure risks, and indoor ventilation guidance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AERIS — Urban Air Quality & Exposure Intelligence Portal',
    description:
      'Live India CPCB NAQI monitoring, personalized household exposure risks, and indoor ventilation guidance.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[#f4f6f9] text-slate-900 selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
