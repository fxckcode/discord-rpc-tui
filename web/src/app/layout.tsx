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
  metadataBase: new URL('https://rpcraft.cloud'),
  applicationName: 'RPCraft',
  keywords: [
    'rpcraft',
    'discord',
    'rpc',
    'rich presence',
    'discord presence',
    'presence gallery',
    'craft your presence',
    'discord rpc',
    'discord rich presence gallery',
  ],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RPCraft',
    title: 'RPCraft — Craft your Discord Presence',
    description:
      'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command.',
    images: [{ url: '/og.svg', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RPCraft — Craft your Discord Presence',
    description:
      'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command.',
    images: ['/og.svg'],
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'RPCraft',
              url: 'https://rpcraft.cloud',
              description: 'Browse and apply beautiful Rich Presences to your Discord profile with a single terminal command.',
              applicationCategory: 'Multimedia',
              operatingSystem: 'Linux, macOS, Windows',
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'RPCraft',
              url: 'https://rpcraft.cloud',
              description: 'Craft your Discord Presence. CLI, TUI, web gallery, and MCP server for Discord Rich Presence.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Linux, macOS, Windows',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RPCraft',
              url: 'https://rpcraft.cloud',
              logo: 'https://rpcraft.cloud/icon.svg',
              sameAs: [
                'https://github.com/fxckcode/discord-rpc-tui',
                'https://linktree.diegoduran.site/',
              ],
              author: {
                '@type': 'Person',
                name: 'fxckcode',
                url: 'https://linktree.diegoduran.site/',
              },
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}})()`
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
