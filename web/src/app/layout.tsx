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
    default: 'RPCraft — Craft your Discord Presence',
    template: '%s — RPCraft',
  },
  description:
    'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command. Craft your presence.',
  metadataBase: new URL('https://rpcraft.sh'),
  applicationName: 'RPCraft',
  keywords: [
    'rpcraft',
    'discord',
    'rpc',
    'rich presence',
    'discord presence',
    'presence gallery',
    'craft your presence',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RPCraft',
    title: 'RPCraft — Craft your Discord Presence',
    description:
      'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RPCraft — Craft your Discord Presence',
    description:
      'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command.',
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
