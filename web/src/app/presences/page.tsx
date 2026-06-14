'use client';

import { useState } from 'react';
import Link from 'next/link';
import { presences, categories } from '@/data/presences';
import { ACTIVITY_TYPE_LABELS, type ActivityType } from '@/types';

function PresenceCard({ presence, index }: { presence: (typeof presences)[number]; index: number }) {
  const typeLabel =
    ACTIVITY_TYPE_LABELS[presence.activity.type as ActivityType];
  const staggerClass = `stagger-delay-${Math.min(index + 1, 6)}`;

  return (
    <Link
      href={`/presences/${presence.id}`}
      className={`card block overflow-hidden no-underline animate-fade-in-up ${staggerClass} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
    >
      {/* Preview area */}
      <div className="border-hairline bg-canvas-soft border-b px-5 py-7">
        {presence.activity.largeImageKey && (
          <div className="mb-3 flex items-center gap-3">
            <div className="from-primary/10 to-primary/5 flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br">
              <span className="text-base opacity-40">◆</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-ink truncate text-sm font-medium">
                {presence.activity.name || presence.name}
              </p>
              <span
                className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--timeline-grep) 20%, transparent)`,
                  color: 'var(--ink)'
                }}
              >
                {typeLabel}
              </span>
            </div>
          </div>
        )}
        {presence.activity.state && (
          <p className="body-sm text-ink/80">{presence.activity.state}</p>
        )}
        {presence.activity.details && (
          <p className="text-muted mt-1 line-clamp-1 text-sm">
            {presence.activity.details}
          </p>
        )}
      </div>

      {/* Tags + Category */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        <span className="caption-uppercase text-primary/70">
          {presence.category}
        </span>
        {presence.tags.slice(0, 2).map(tag => (
          <span
            key={tag}
            className="bg-surface-strong text-muted inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
          >
            {tag}
          </span>
        ))}
        {presence.tags.length > 2 && (
          <span className="text-muted-soft text-[10px]">
            +{presence.tags.length - 2}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? presences.filter(p => p.category === activeCategory)
    : presences;

  return (
    <div className="bg-canvas">
      <div className="container-wide section-padding">
        {/* Header */}
        <div className="mb-4">
          <h1 className="display-lg animate-fade-in-up">Presence Gallery</h1>
          <p className="body-md text-muted mt-2 animate-fade-in-up stagger-delay-1">
            Browse {presences.length} curated presences. Pick your vibe, copy
            the command, apply instantly.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap gap-2 animate-fade-in-up stagger-delay-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
              activeCategory === null
                ? 'bg-ink text-canvas'
                : 'bg-surface-strong text-muted hover:bg-surface-strong/80'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-ink text-canvas'
                  : 'bg-surface-strong text-muted hover:bg-surface-strong/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="body-md text-muted">
              No presences found in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((presence, i) => (
              <PresenceCard key={presence.id} presence={presence} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
