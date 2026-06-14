'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const sections = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'setup-discord', label: 'Setup Discord Developer Portal' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'using-presences', label: 'Using Presences' },
  { id: 'troubleshooting', label: 'Troubleshooting' }
];

export function DocsSidebar() {
  const [activeId, setActiveId] = useState('quick-start');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    const sectionEls = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    sectionEls.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <aside className="docs-sidebar">
      <div className="sticky top-24 pb-8">
        <h4 className="text-muted caption-uppercase mb-4">Documentation</h4>
        <nav>
          <ul className="flex flex-col gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`#${section.id}`}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                    activeId === section.id
                      ? 'bg-surface-strong text-ink font-medium'
                      : 'text-body hover:text-ink hover:bg-surface-strong/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(section.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', `#${section.id}`);
                    }
                  }}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
