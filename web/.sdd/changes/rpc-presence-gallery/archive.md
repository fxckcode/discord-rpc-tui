# Archive: Discord RPC Presence Gallery Web

## Summary
- **Proposal:** `.sdd/changes/rpc-presence-gallery/proposal.md`
- **Spec:** `.sdd/changes/rpc-presence-gallery/spec.md`
- **Tasks:** 4 tasks, all AFK
- **Verification:** PASS

## Files Created
```
/home/fxckcode/projects/rpc-presence-gallery/
├── src/
│   ├── app/
│   │   ├── globals.css                # Cursor design tokens + utilities
│   │   ├── layout.tsx                  # Root layout with Inter + JetBrains Mono
│   │   ├── not-found.tsx               # 404 page
│   │   ├── page.tsx                    # Landing page (hero, features, code preview, CTA)
│   │   └── presences/
│   │       ├── page.tsx                # Gallery with category filter grid
│   │       └── [id]/page.tsx           # Detail page with apply command
│   ├── components/
│   │   ├── layout/
│   │   │   ├── nav.tsx                 # Sticky top nav (Cursor style)
│   │   │   └── footer.tsx              # Footer with 3 columns
│   │   └── presences/
│   │       └── apply-command.tsx       # Copyable terminal command + clipboard
│   ├── data/
│   │   └── presences.ts                # 15 curated presences across 5 categories
│   └── types/
│       └── index.ts                    # Presence, ActivityConfig, type helpers
```

## Routes
- `/` — Landing page with hero, featured presences, features, code preview, CTA
- `/presences` — Gallery with category filter (15 presences, 5 categories)
- `/presences/[id]` — Detail page with full activity card + copyable apply command
- `/_not-found` — Custom 404

## Design System
- **Canvas:** #f7f7f4 warm cream
- **Ink:** #26251e warm near-black
- **Primary:** #f54e00 Cursor Orange (CTAs only)
- **Font:** Inter (CursorGothic substitute) + JetBrains Mono (code)
- **Depth:** Hairline-only, no shadows
- **Display:** Weight 400, negative letter-spacing

## Key Features
- 15 curated presences (Coding, Gaming, Music, Creative, Social)
- Category filtering with pill-style buttons
- One-click "Copy Command" with `rpc-tui mcp set_activity`
- Responsive: 3-col → 2-col → 1-col grid
- Sticky nav + footer
- SSG (all pages statically generated)

## What Was Learned
- Tailwind v4 `@utility` doesn't support pseudo-classes like `:hover` — need separate utility names
- Next.js 15 requires `params: Promise<{ id: string }>` with `async` components
- Template had strict ESLint (comma-dangle: never) and `@utility` limitations
