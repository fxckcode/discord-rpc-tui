# Proposal: Discord RPC Presence Gallery Web

## Intent
A beautiful, minimalistic web app to browse a gallery of Discord Rich Presences, view detailed presence cards, and apply them to the user's local discord-rpc-tui with a single terminal command.

## Inspiration
- **Cursor Design System** — warm cream canvas (#f7f7f4), warm near-black ink (#26251e), Cursor Orange (#f54e00) sparingly for CTAs, weight 400 display, hairline-only depth, JetBrains Mono for code
- **Lanyard community** — presence visualizers, Discord identity cards
- **Minimal Gallery** — hand-picked minimal web design curation

## Scope

### In
- [x] Landing page with hero, features section (Cursor design system)
- [x] User auth (login/register) — email + password
- [x] Presence gallery/feed — grid of presence cards with activity preview
- [x] Presence detail page — full card with state, details, timestamps, images, buttons
- [x] "Download" / "Apply" button that generates a terminal command for discord-rpc-tui
- [x] Cursor design system across all pages (cream canvas, ink text, CTA orange sparingly)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Static presence data (curated presences, no dynamic creation from users in V1)

### Out
- [ ] Presence creation/editor UI
- [ ] User-generated presences (community uploads)
- [ ] WebSocket live presence updates
- [ ] Integration with Lanyard API (future)
- [ ] Admin panel

## Tech Stack
| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | Next.js 15 (template) | App Router, RSC, Server Actions |
| Language | TypeScript 5 | Strict typing |
| Styling | Tailwind CSS v4 | From template, Cursor design as CSS vars |
| UI | shadcn/ui + Radix | From template, accessible components |
| State | Zustand | Client state (filters, preferences) |
| Data fetching | React Query | Server data (presences list) |
| Auth | NextAuth.js / Auth.js | Email/password, session management |
| Database | SQLite (via Turso/libsql) or simple JSON | V1 — presences are static curated data |
| Fonts | Inter (CursorGothic substitute) + JetBrains Mono | Per Cursor design spec |
| Deployment | Vercel (or pnpm build) | Zero-config Next.js deploy |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page (hero, features)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── presences/
│       ├── page.tsx           # Gallery feed
│       └── [id]/page.tsx      # Presence detail
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/
│   │   ├── nav.tsx           # Top nav (Cursor style)
│   │   └── footer.tsx
│   ├── presences/
│   │   ├── presence-card.tsx  # Gallery card
│   │   ├── presence-detail.tsx # Full detail card
│   │   └── presence-grid.tsx  # Grid layout
│   └── apply-command.tsx     # Terminal command generator
├── data/
│   └── presences.ts          # Curated presences data
├── lib/
│   └── utils.ts              # cn(), etc.
├── styles/
│   └── globals.css           # Cursor design tokens as CSS vars
└── types/
    └── index.ts              # Presence types (mirrors discord-rpc-tui)
```

## Data Model (Presence)
```typescript
interface Presence {
  id: string;
  name: string;
  description: string;
  category: string;
  activity: {
    name?: string;          // "Playing <name>"
    state?: string;
    details?: string;
    type: 0 | 1 | 2 | 3 | 5;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    buttons?: { label: string; url: string }[];
  };
  clientId?: string;        // For users who want to apply
  tags: string[];
  featured?: boolean;
}
```

## Risks
- **Auth complexity** — adding auth for just "saving favorites" in V1 may be overkill. Risk: adds complexity without clear benefit.
  → Mitigation: Make auth optional in V1, or use a simple email/password setup
- **Design faithfulness** — Cursor design system uses CursorGothic (licensed font). We substitute with Inter.
  → Mitigation: Inter at weight 400 with -1.5% letter-spacing matches closely
- **Template compatibility** — template uses Tailwind v4, may have breaking changes
  → Mitigation: Pin versions from template's package.json

## Tech Stack Questions for the User

1. **Auth provider?** — Auth.js with email/password (simplest), or Supabase Auth (more features)
2. **Database?** — Do you want real DB for saved presences, or static data file is enough for V1?
3. **How to handle the "apply" command?** — Just show a copyable terminal command like `cmd -p "Apply presence: ..."`, or should it talk directly to the discord-rpc-tui MCP server?
4. **Static presences or dynamic?** — For V1, I'll include curated presences (like the ones from your config). Later you can add a community gallery

## User Flow
1. User lands on landing page → sees hero with presence preview
2. Browses gallery of presences
3. Clicks a presence → detail page with full card, copyable terminal command
4. Copies command → pastes in terminal → applies to their local discord-rpc-tui
5. Discord presence updates instantly
