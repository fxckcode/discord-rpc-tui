import Link from 'next/link';

export function Logo({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 24, md: 32, lg: 44 };
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 no-underline group"
    >
      {/* Icon mark — hexagon with R, radar sweep */}
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Canvas bg */}
        <circle cx="32" cy="32" r="30" className="fill-canvas" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {/* Radar arcs */}
        <path d="M 32 14 A 18 18 0 1 1 18 24" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
        <path d="M 32 17 A 15 15 0 1 1 21 25" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55" />
        {/* Hexagon core */}
        <polygon points="32,24 42,31 42,45 32,52 22,45 22,31" fill="#26251e" />
        {/* Inner circle + R */}
        <circle cx="32" cy="38" r="7" className="fill-canvas" />
        <path d="M 28 38 L 32 38 L 35 34 M 32 38 L 35 42" stroke="#26251e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Radar dot */}
        <circle cx="32" cy="14" r="2" fill="var(--primary)" className="transition-all duration-300" />
      </svg>

      {/* Wordmark */}
      <span className={`font-sans font-normal tracking-tight text-ink ${textSizes[size]}`}>
        <span className="inline-flex items-baseline gap-0">
          Engineering
          <span className="text-primary font-normal mx-1">Reality</span>
        </span>
      </span>
    </Link>
  );
}
