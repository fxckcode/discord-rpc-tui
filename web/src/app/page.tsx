import Link from 'next/link';
import { presences, getFeaturedPresences } from '@/data/presences';
import { ACTIVITY_TYPE_LABELS, type ActivityType } from '@/types';

function PresenceCard({ presence, index }: { presence: (typeof presences)[number]; index: number }) {
  const typeLabel = ACTIVITY_TYPE_LABELS[presence.activity.type as ActivityType];
  const staggerClass = `stagger-delay-${Math.min(index + 1, 6)}`;

  return (
    <Link
      href={`/presences/${presence.id}`}
      className={`card block overflow-hidden no-underline animate-fade-in-up ${staggerClass} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
    >
      {/* Activity preview */}
      <div className="border-b border-hairline bg-canvas-soft px-6 py-8">
        {presence.activity.largeImageKey && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5 text-lg">
              <span className="text-lg opacity-50">◆</span>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {presence.activity.name || presence.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--timeline-grep) 20%, transparent)`,
                    color: 'var(--ink)'
                  }}
                >
                  {typeLabel}
                </span>
              </div>
            </div>
          </div>
        )}
        {presence.activity.state && (
          <p className="body-sm text-ink/80">{presence.activity.state}</p>
        )}
        {presence.activity.details && (
          <p className="mt-1 text-sm text-muted line-clamp-1">
            {presence.activity.details}
          </p>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="body-sm text-muted">{presence.name}</span>
        <span className="caption-uppercase text-muted-soft">
          {presence.category}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const featured = getFeaturedPresences();
  const allPresences = presences;

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative section-padding bg-canvas overflow-hidden">
        {/* Blur blobs — enhanced */}
        <div
          className="absolute -top-48 -right-32 h-[600px] w-[600px] rounded-full blur-[120px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,78,0,0.18) 0%, rgba(245,78,0,0.05) 40%, transparent 70%)'
          }}
        />
        <div
          className="absolute -bottom-48 -left-32 h-[550px] w-[550px] rounded-full blur-[120px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(88,101,242,0.15) 0%, rgba(88,101,242,0.04) 40%, transparent 70%)'
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(159,201,162,0.08) 0%, transparent 60%)'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-full max-w-3xl rounded-full blur-[120px] pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,78,0,0.06) 0%, transparent 70%)'
          }}
        />

        <div className="container-wide relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            {/* Brand mark */}
            <div className="mb-8 flex justify-center animate-fade-in-up stagger-delay-1">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-90"
              >
                <circle cx="32" cy="32" r="30" fill="var(--canvas)" stroke="var(--hairline)" strokeWidth="1" />
                <polygon points="32,10 47,19 47,37 32,46 17,37 17,19" fill="#26251e" />
                <polygon points="32,21 39,28 32,35 25,28" fill="var(--primary)" />
                <path d="M 45 14 A 22 22 0 0 1 52 28" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
                <path d="M 48 10 A 28 28 0 0 1 56 26" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2" />
              </svg>
            </div>
            <h1 className="display-mega mb-6 animate-fade-in-up stagger-delay-2">
              Your Discord Presence.
              <br />
              <span className="text-primary">Curated.</span>
            </h1>
            <p className="body-md mx-auto mb-10 max-w-xl text-muted animate-fade-in-up stagger-delay-3">
              Browse and apply beautiful Rich Presences to your Discord profile
              with a single terminal command. No bloat. Just good design.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up stagger-delay-3">
              <Link href="/presences" className="btn-primary no-underline">
                Browse Presences
              </Link>
              <a
                href="#features"
                className="btn-secondary no-underline"
              >
                Learn More
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 text-sm font-medium no-underline hover:underline"
                style={{ color: 'var(--muted)' }}
              >
                Read the Docs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Featured Strip ═══ */}
      {featured.length > 0 && (
        <section className="border-t border-hairline bg-canvas">
          <div className="container-wide py-12">
            <p className="caption-uppercase mb-6 text-center text-muted animate-fade-in-up">
              Featured Presences
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((presence, i) => (
                <PresenceCard key={presence.id} presence={presence} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* ═══ How It Works — Step by Step ═══ */}
      <section className="border-t border-hairline bg-canvas">
        <div className="container-wide section-padding">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="caption-uppercase mb-3 text-muted">Getting Started</p>
            <h2 className="display-lg">
              Three steps to a custom Discord presence
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink">
                <span className="text-sm font-medium text-canvas">1</span>
              </div>
              <h3 className="title-md mb-3">Install the CLI</h3>
              <p className="body-sm mb-4 text-muted">
                Install{' '}
                <a
                  href="https://github.com/fxckcode/discord-rpc-tui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2"
                >
                  discord-rpc-tui
                </a>{' '}
                — the terminal tool that powers your Rich Presence.
              </p>
              <div className="card overflow-hidden text-left text-[11px]">
                <pre className="overflow-x-auto p-3 font-mono leading-relaxed text-ink">
                  <span className="text-muted"># One command to install</span>{'\n'}
                  <span className="text-semantic-success">$</span> git clone https://github.com/fxckcode/discord-rpc-tui.git{'\n'}
                  <span className="text-semantic-success">$</span> cd discord-rpc-tui && bash install.sh{'\n'}
                  <span className="text-muted"># Start the server</span>{'\n'}
                  <span className="text-semantic-success">$</span> rpc-tui mcp
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink">
                <span className="text-sm font-medium text-canvas">2</span>
              </div>
              <h3 className="title-md mb-3">Browse the Gallery</h3>
              <p className="body-sm mb-4 text-muted">
                Explore curated presences across gaming, coding, music, and more. Each one is ready to apply.
              </p>
              <div className="card overflow-hidden text-left">
                <div className="space-y-1.5 p-3">
                  <div className="flex items-center gap-2.5 rounded-md bg-surface-strong/50 px-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary">
                      ◆
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[11px] font-medium text-ink">
                        Engineering Reality with AI
                      </p>
                      <p className="truncate text-[10px] text-muted-soft">
                        Coding · Featured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md bg-surface-strong/50 px-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-timeline-read/20 text-[10px] font-medium text-ink">
                      ♪
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[11px] font-medium text-ink">
                        Aether Waves
                      </p>
                      <p className="truncate text-[10px] text-muted-soft">
                        Music · Listening
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md bg-surface-strong/50 px-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-timeline-grep/20 text-[10px] font-medium text-ink">
                      ▸
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[11px] font-medium text-ink">
                        Storm Chaser
                      </p>
                      <p className="truncate text-[10px] text-muted-soft">
                        Gaming · Playing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <a
                href="/presences"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary no-underline hover:underline"
              >
                Browse all presences →
              </a>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ink">
                <span className="text-sm font-medium text-canvas">3</span>
              </div>
              <h3 className="title-md mb-3">Copy &amp; Apply</h3>
              <p className="body-sm mb-4 text-muted">
                Copy the terminal command from any presence page and paste it. Your Discord updates instantly.
              </p>
              <div className="card overflow-hidden text-left text-[11px]">
                <pre className="overflow-x-auto p-3 font-mono leading-relaxed text-ink">
                  <span className="text-muted"># Copy &amp; paste this</span>{'\n'}
                  <span className="text-semantic-success">$</span> rpc-tui set-activity '{'\n'}
                  {'  '}&quot;state&quot;: &quot;Forging the unseen&quot;,{'\n'}
                  {'  '}&quot;details&quot;: &quot;TypeScript &middot; Systems &middot; Inference&quot;,{'\n'}
                  {'  '}&quot;largeImageKey&quot;: &quot;imagen&quot;{'\n'}
                  {'}'}&#39;{'\n'}
                  <span className="text-muted"># Discord updates instantly ✨</span>
                </pre>
              </div>
              <div className="mt-3 flex items-start gap-2 text-left">
                <span className="shrink-0 text-[10px] text-semantic-success">✓</span>
                <p className="text-[11px] leading-relaxed text-muted-soft">
                  Updates config, restarts the service, returns instantly. Terminal libre
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ Docs Callout ═══ */}
      <section className="border-t border-hairline bg-canvas-soft">
        <div className="container-wide py-16 text-center">
          <p className="body-md mb-6 text-muted">
            Need help setting up? Check the documentation for step-by-step guides.
          </p>
          <Link href="/docs" className="btn-primary no-underline">
            Visit Docs →
          </Link>
        </div>
      </section>

      <section id="features" className="section-padding bg-canvas">
        <div className="container-wide">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="display-lg mb-4 animate-fade-in-up">
              Designed for how you actually use Discord
            </h2>
            <p className="body-md text-muted animate-fade-in-up stagger-delay-1">
              No clutter. No distractions. Just beautiful presences that reflect
              what you are doing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card p-6 animate-fade-in-up stagger-delay-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-canvas-soft animate-float">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h3 className="title-md mb-2">Curated Gallery</h3>
              <p className="body-sm text-muted">
                Hand-picked presences across gaming, coding, music, and more.
                Every presence tells a story.
              </p>
            </div>

            <div className="card p-6 animate-fade-in-up stagger-delay-2 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-canvas-soft">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink"
                >
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className="title-md mb-2">One-Click Apply</h3>
              <p className="body-sm text-muted">
                Copy a terminal command, paste it, done. Your Discord presence
                updates instantly with no extra tools.
              </p>
            </div>

            <div className="card p-6 animate-fade-in-up stagger-delay-3 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-canvas-soft">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink"
                >
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                </svg>
              </div>
              <h3 className="title-md mb-2">Beautiful Design</h3>
              <p className="body-sm text-muted">
                Cursor-inspired minimal aesthetic. Warm cream canvas, clean
                typography, and a calm visual experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA Band ═══ */}
      <section className="border-t border-hairline bg-canvas">
        <div className="container-wide py-24 text-center">
          <h2 className="display-lg mb-6 animate-fade-in-up">
            Ready to elevate your Discord?
          </h2>
          <p className="body-md mx-auto mb-8 max-w-md text-muted animate-fade-in-up stagger-delay-1">
            Browse the gallery and find the presence that matches your vibe.
          </p>
          <Link href="/presences" className="btn-primary no-underline animate-fade-in-up stagger-delay-2">
            Browse All Presences
          </Link>
        </div>
      </section>

      {/* ═══ All Presences ═══ */}
      <section className="border-t border-hairline bg-canvas">
        <div className="container-wide section-padding">
          <h2 className="display-lg mb-2 animate-fade-in-up">All Presences</h2>
          <p className="body-md mb-10 text-muted animate-fade-in-up stagger-delay-1">
            {allPresences.length} curated presences across{' '}
            {new Set(allPresences.map((p) => p.category)).size} categories
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allPresences.map((presence, i) => (
              <PresenceCard key={presence.id} presence={presence} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
