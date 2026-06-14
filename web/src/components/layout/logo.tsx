import Link from 'next/link';

export function Logo({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 20, md: 28, lg: 36 };

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 no-underline"
    >
      {/* Mark */}
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer ring — subtle presence indicator */}
        <circle
          cx="16"
          cy="16"
          r="14.5"
          stroke="currentColor"
          strokeWidth="1"
          className="text-hairline-strong"
          opacity={0.4}
        />
        {/* Diamond — the core mark, Cursor Orange */}
        <path
          d="M16 6L22 16L16 26L10 16L16 6Z"
          fill="var(--primary)"
          opacity={0.9}
        />
        {/* Inner glow */}
        <path
          d="M16 10L19.5 16L16 22L12.5 16L16 10Z"
          fill="var(--on-primary)"
          opacity={0.5}
        />
        {/* Pulse dot — active presence */}
        <circle cx="16" cy="16" r="2" fill="var(--on-primary)" />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-sans font-normal tracking-tight text-ink ${
          size === 'lg' ? 'text-xl' : 'text-sm'
        }`}
        style={{ letterSpacing: '-0.02em' }}
      >
        presence{'\u00A0'}
        <span className="text-primary font-normal">gallery</span>
      </span>
    </Link>
  );
}
