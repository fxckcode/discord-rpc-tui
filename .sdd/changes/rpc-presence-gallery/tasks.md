# Tasks: Discord RPC Presence Gallery Web

## Task Order
T1 ← T2 (parallel) ← T3 ← T4 ← T5

## Tasks

### T1: Scaffold from template + Design System + Layout (AFK · cmd 15 turns)
- **Files:** Project root (next.config, package.json, tailwind.css, globals.css, layout.tsx, nav.tsx, footer.tsx)
- **Acceptance:** Project builds, Cursor design tokens in globals.css, nav+footer render on all pages, Inter + JetBrains Mono loaded
- **Steps:**
  1. Clone template-starter-nextjs to /home/fxckcode/projects/rpc-presence-gallery
  2. Install deps (pnpm install)
  3. Set up Cursor design tokens as CSS custom properties in globals.css
  4. Set up Inter (from Google Fonts) + JetBrains Mono
  5. Create root layout with nav + footer
  6. Make sure build passes

### T2: Curated Presences Data (AFK · cmd 5 turns)
- **Files:** src/data/presences.ts, src/types/index.ts
- **Acceptance:** 12+ curated presences with diverse categories (Gaming, Coding, Music, Social, Creative), types match spec
- **Steps:**
  1. Create types based on Presence interface from spec
  2. Create data file with 15 curated presences covering categories: Gaming, Coding, Music, Social, Creative
  3. Include presences inspired by user's discord-rpc-tui config

### T3: Landing Page (AFK · cmd 12 turns)
- **Files:** src/app/page.tsx, custom landing components
- **Acceptance:** Hero with display-mega, features section, code example, CTA band, Cursor design, responsive
- **Steps:**
  1. Hero band: 72px headline "Your Discord Presence. Curated.", subhead "Browse and apply beautiful Rich Presences to your Discord profile with one command.", two CTAs
  2. Features strip: 3 feature cards (Curated Gallery, One-Click Apply, Beautiful Design)
  3. Code block preview showing rpc-tui command
  4. Pre-footer CTA band "Ready to elevate your Discord?" + CTA
  5. Responsive: hero 72→32px on mobile, feature grid 3→1

### T4: Gallery + Detail Pages (AFK · cmd 15 turns)
- **Files:** src/app/presences/page.tsx, src/app/presences/[id]/page.tsx, presence-card.tsx, presence-detail.tsx, presence-grid.tsx
- **Acceptance:** Gallery shows all presences, filtering works, detail page shows full card with apply command, copy button works
- **Steps:**
  1. Gallery page: heading, category filter pills, responsive grid
  2. Presence card component: activity name, state, details, type badge, tags, category
  3. Detail page: full activity display, buttons section, code block with rpc-tui command
  4. Copy to clipboard functionality for command
  5. 404 handling for unknown presences
  6. Responsive: grid 3→2→1 columns
