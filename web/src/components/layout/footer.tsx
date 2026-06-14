import Link from 'next/link';
import { Logo } from '@/components/layout/logo';

export function Footer() {
  return (
    <footer className="hairline-top bg-canvas">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Logo size="md" />
          <p className="text-muted text-sm leading-relaxed mt-3">
            Beautiful Discord Rich Presences, curated and ready to apply.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="caption-uppercase text-muted mb-4">Navigate</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="body-sm text-muted hover:text-ink no-underline"
            >
              Home
            </Link>
            <Link
              href="/presences"
              className="body-sm text-muted hover:text-ink no-underline"
            >
              Gallery
            </Link>
          </div>
        </div>

        {/* Built with */}
        <div>
          <p className="caption-uppercase text-muted mb-4">Built with</p>
          <p className="body-sm text-muted">
            Next.js · Tailwind CSS · Cursor Design System
          </p>
          <p className="text-muted-soft mt-2 text-sm">
            Powered by{' '}
            <a
              href="https://github.com/fxckcode/discord-rpc-tui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink underline underline-offset-2"
            >
              discord-rpc-tui
            </a>
          </p>
        </div>
      </div>

      <div className="hairline-top">
        <div className="container-wide flex items-center justify-between py-6">
          <p className="text-muted-soft text-xs">
            &copy; {new Date().getFullYear()} — Not affiliated with Discord Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
