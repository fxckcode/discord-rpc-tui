import Link from 'next/link';

export function Logo({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 24, md: 32, lg: 44 };

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 no-underline group"
    >
      {/* Icon mark — hexagon with presence diamond */}
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Base circle */}
        <circle cx="32" cy="32" r="30" className="fill-canvas" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        {/* Hexagon — engineering core */}
        <polygon points="32,10 47,19 47,37 32,46 17,37 17,19" fill="#26251e" />
        {/* Diamond — presence indicator */}
        <polygon points="32,21 39,28 32,35 25,28" fill="var(--primary)" />
        {/* Signal arcs */}
        <path d="M 45 14 A 22 22 0 0 1 52 28" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M 48 10 A 28 28 0 0 1 56 26" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
      </svg>

      {/* Wordmark */}
      <span className="hidden sm:inline font-sans font-normal tracking-tight text-ink">
        <span className="inline-flex items-baseline gap-0">
          Engineering
          <span className="font-normal mx-1" style={{ color: 'var(--primary)' }}>Reality</span>
        </span>
      </span>
    </Link>
  );
}
