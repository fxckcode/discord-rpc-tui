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
            <Link
              href="/docs"
              className="body-sm text-muted hover:text-ink no-underline"
            >
              Docs
            </Link>
          </div>
        </div>

        {/* Connect */}
        <div>
          <p className="caption-uppercase text-muted mb-4">Connect</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/fxckcode"
              target="_blank"
              rel="noopener noreferrer"
              className="body-sm text-muted hover:text-ink no-underline inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
            <a
              href="https://linktr.ee/fxckcode"
              target="_blank"
              rel="noopener noreferrer"
              className="body-sm text-muted hover:text-ink no-underline inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12zM8.5 5.5h7v2h-7v-2zm0 4h7v2h-7v-2zm0 4h7v2h-7v-2zm-3-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/></svg>
              Linktree
            </a>
            <p className="text-muted-soft mt-2 text-xs">
              Built by{' '}
              <a
                href="https://linktr.ee/fxckcode"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-ink underline underline-offset-2"
              >
                fxckcode
              </a>
            </p>
          </div>
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
