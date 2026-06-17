import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import './globals.css';
import './animations.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: 'Engineering Reality — Discord Rich Presence Gallery',
    template: '%s — Engineering Reality',
  },
  description:
    'Browse, discover, and apply beautiful Rich Presences to your Discord profile with one terminal command.',
  metadataBase: new URL('https://discord-rpc-tui.vercel.app'),
  applicationName: 'Discord RPC Gallery',
  keywords: [
    'discord',
    'rpc',
    'rich presence',
    'discord presence',
    'gallery',
    'engineering reality',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Engineering Reality',
    title: 'Engineering Reality — Discord Rich Presence Gallery',
    description:
      'Browse, discover, and apply beautiful Rich Presences to your Discord profile with one terminal command.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Reality — Discord Rich Presence Gallery',
    description:
      'Browse, discover, and apply beautiful Rich Presences to your Discord profile with one terminal command.',
  },
  icons: {
    icon: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`
          }}
        />
      </head>
      <body className="min-h-screen">
        <SpeedInsights />
        <Analytics />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
