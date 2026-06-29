import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Complete guide to RPCraft — install, configure, and apply beautiful Discord Rich Presences with one terminal command.',
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'Documentation — RPCraft',
    description:
      'Complete guide to RPCraft — install, configure, and apply beautiful Discord Rich Presences with one terminal command.',
  },
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
