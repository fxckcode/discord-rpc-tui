import Link from 'next/link';
import { notFound } from 'next/navigation';
import { presences, getPresenceById } from '@/data/presences';
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_COLORS,
  type ActivityType
} from '@/types';
import { ApplyCommand } from '@/components/presences/apply-command';

export function generateStaticParams() {
  return presences.map(p => ({
    id: p.id
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presence = getPresenceById(id);
  if (!presence) return { title: 'Presence Not Found' };
  return {
    title: `${presence.name} — Presence Gallery`,
    description: presence.description || `Apply the "${presence.name}" Discord Rich Presence to your profile. ${presence.activity.state || ''}`,
    alternates: {
      canonical: `/presences/${presence.id}`,
    },
    openGraph: {
      title: `${presence.name} — RPCraft`,
      description: presence.description,
      images: [{ url: '/og.svg', width: 512, height: 512 }],
    },
    twitter: {
      title: `${presence.name} — RPCraft`,
      description: presence.description,
      images: ['/og.svg'],
    },
  };
}

export default async function PresenceDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const presence = getPresenceById(id);

  if (!presence) {
    notFound();
  }

  const typeLabel =
    ACTIVITY_TYPE_LABELS[presence.activity.type as ActivityType];
  const typeColor =
    ACTIVITY_TYPE_COLORS[presence.activity.type as ActivityType];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rpcraft.cloud/' },
      { '@type': 'ListItem', position: 2, name: 'Presence Gallery', item: 'https://rpcraft.cloud/presences' },
      { '@type': 'ListItem', position: 3, name: presence.activity.name || presence.name, item: `https://rpcraft.cloud/presences/${presence.id}` },
    ],
  };

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd)
        }}
      />
      <div className="container-wide section-padding">
        {/* Back link */}
        <Link
          href="/presences"
          className="body-sm text-muted hover:text-ink mb-8 inline-flex items-center gap-1.5 no-underline transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Gallery
        </Link>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* ═══ Presence Card — Main Display ═══ */}
          <div className="lg:col-span-3 animate-fade-in-up">
            <div className="card overflow-hidden">
              {/* Image preview */}
              {presence.activity.largeImageKey && (
                <div className="from-primary/5 via-canvas-soft to-timeline-read/10 flex aspect-video items-center justify-center bg-gradient-to-br">
                  <div className="text-center">
                    <div className="bg-surface-card mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-xl shadow-sm">
                      <span className="text-3xl opacity-30">◆</span>
                    </div>
                    <p className="text-muted-soft text-xs">
                      {presence.activity.largeImageKey}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity fields */}
              <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="display-md mb-1">
                      {presence.activity.name || presence.name}
                    </h1>
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${typeColor} 20%, transparent)`,
                        color: 'var(--ink)'
                      }}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <span className="caption-uppercase text-muted-soft">
                    {presence.category}
                  </span>
                </div>

                {presence.activity.state && (
                  <div className="mb-4">
                    <p className="caption-uppercase text-muted mb-1">State</p>
                    <p className="body-md text-ink">
                      {presence.activity.state}
                    </p>
                  </div>
                )}

                {presence.activity.details && (
                  <div className="mb-4">
                    <p className="caption-uppercase text-muted mb-1">Details</p>
                    <p className="body-md text-ink">
                      {presence.activity.details}
                    </p>
                  </div>
                )}

                {presence.activity.largeImageText && (
                  <div className="mb-4">
                    <p className="caption-uppercase text-muted mb-1">
                      Image Text
                    </p>
                    <p className="body-sm text-ink">
                      {presence.activity.largeImageText}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                {presence.activity.buttons &&
                  presence.activity.buttons.length > 0 && (
                    <div className="mb-4">
                      <p className="caption-uppercase text-muted mb-2">
                        Buttons
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {presence.activity.buttons.map(
                          (btn: { label: string; url: string }, i: number) => (
                            <a
                              key={i}
                              href={btn.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-xs no-underline"
                            >
                              {btn.label}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Description */}
                <div className="hairline-top pt-6">
                  <p className="body-sm text-muted leading-relaxed">
                    {presence.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Apply Panel ═══ */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-delay-1">
            <div className="card p-6 lg:sticky lg:top-24">
              <p className="title-md mb-1">Apply This Presence</p>
              <p className="body-sm text-muted mb-5">
                Copy the command below and paste it into your terminal.
              </p>

              <div className="mb-4">
                <ApplyCommand presence={presence} />
              </div>

              {/* Info tips */}
              <div className="hairline-top pt-5">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <span className="bg-surface-strong text-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                      1
                    </span>
                    <p className="text-muted text-xs leading-relaxed">
                      Ensure{' '}
                      <a
                        href="https://github.com/fxckcode/discord-rpc-tui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink underline underline-offset-2"
                      >
                        discord-rpc-tui
                      </a>{' '}
                      is running in MCP mode
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-surface-strong text-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                      2
                    </span>
                    <p className="text-muted text-xs leading-relaxed">
                      Paste the command in your terminal and press Enter
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-surface-strong text-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                      3
                    </span>
                    <p className="text-muted text-xs leading-relaxed">
                      Your Discord presence updates instantly
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="hairline-top mt-5 pt-5">
                <p className="caption-uppercase text-muted mb-3">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {presence.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-surface-strong text-muted inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
