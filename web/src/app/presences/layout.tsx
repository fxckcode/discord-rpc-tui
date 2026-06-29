import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Presence Gallery',
  description:
    'Browse 15 curated Discord Rich Presences across Coding, Music, Gaming, Creative, and Social categories. Copy and apply with one terminal command.',
  alternates: {
    canonical: '/presences',
  },
  openGraph: {
    title: 'Presence Gallery — RPCraft',
    description:
      'Browse 15 curated Discord Rich Presences across Coding, Music, Gaming, Creative, and Social categories.',
  },
};

export default function PresencesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
