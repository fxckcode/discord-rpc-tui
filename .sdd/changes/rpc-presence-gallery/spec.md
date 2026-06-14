# Spec: Discord RPC Presence Gallery Web

## Requirements

### Functional

- [x] REQ-LANDING: Landing page with hero section (display-mega headline, subhead, CTA to gallery), features strip (3 feature cards), all in Cursor design
- [x] REQ-NAV: Top navigation bar with logo, nav links (Gallery, About), CTA button
- [x] REQ-GALLERY: Gallery page showing presence cards in a responsive grid (3-col desktop → 2-col tablet → 1-col mobile)
- [x] REQ-CARD: Each presence card shows: activity name, state, details, type indicator (Playing/Listening/Watching/Streaming/Competing), image preview, tags, category badge
- [x] REQ-DETAIL: Detail page per presence showing full activity card with all fields (state, details, timestamps, images, buttons), copyable terminal command
- [x] REQ-APPLY: "Apply" section on detail page with a copyable terminal command: `rpc-tui mcp set_activity '{"state": "...", "details": "..."}'` or equivalent
- [x] REQ-FOOTER: Footer with links and credits
- [x] REQ-FILTER: Gallery filtering by category and tags

### Non-Functional

- [x] REQ-DESIGN: All pages follow Cursor design system (cream canvas #f7f7f4, ink #26251e, Cursor Orange #f54e00 for CTAs only, weight 400 display, hairline-only depth, JetBrains Mono on code surfaces)
- [x] REQ-FONTS: Inter as CursorGothic substitute, JetBrains Mono for code
- [x] REQ-RESPONSIVE: Mobile (<640px), tablet (640-1024px), desktop (1024px+)
- [x] REQ-NO-SHADOWS: Hairline-only depth, no drop shadows
- [x] REQ-NO-AUTH: No authentication in V1
- [x] REQ-STATIC: All presence data from static TypeScript file, no database

## Scenarios

### Happy Path
1. User visits landing page → sees hero with Cursor design, scrolls to features
2. Clicks "Browse Presences" CTA → gallery page loads with 12+ presence cards in grid
3. Clicks a presence card → detail page shows full activity
4. Clicks "Copy Command" button → terminal command is copied to clipboard
5. User pastes in terminal → discord-rpc-tui applies presence

### Edge Cases
- **Mobile view**: Cards stack 1-col, nav collapses to hamburger
- **Long presence**: Card truncates long text with ellipsis, full text on detail
- **No image**: Shows fallback gradient placeholder
- **Multiple buttons**: Detail page shows up to 2 buttons (Discord limit)

### Error Cases
- **Unknown presence ID**: Shows 404 page with "Presence not found"
- **Invalid presence data**: Graceful fallback, show what's available

## Interface Changes

### Data File
New file: `src/data/presences.ts` — array of `Presence` objects

### Routes
- `/` — Landing page
- `/presences` — Gallery feed
- `/presences/[id]` — Presence detail
- `/presences/category/[slug]` — Category filtered view (optional)

## Type Definitions
```typescript
interface Presence {
  id: string;
  name: string;
  description: string;
  category: string;
  activity: {
    name?: string;
    state?: string;
    details?: string;
    type: 0 | 1 | 2 | 3 | 5;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    buttons?: { label: string; url: string }[];
  };
  tags: string[];
  featured?: boolean;
  clientId: string; // Default: 788494723714252871
}
```

## Pages

### Landing Page (`/`)
- **Hero band**: Cursor display-mega (72px/400/-2.16px) headline, body-md subhead, button-primary CTA "Browse Presences", button-secondary "Learn More"
- **Features strip**: 2-3 feature cards (feature-card component)
  - "Curated Gallery" — Browse hand-picked presences
  - "One-Click Apply" — Copy terminal command, paste, done
  - "Beautiful Design" — Cursor-inspired minimal aesthetic
- **Code example preview**: Terminal code block showing rpc-tui command
- **CTA band**: Pre-footer band with headline + CTA

### Gallery (`/presences`)
- Top nav with sticky header
- "Presence Gallery" display-lg heading
- Optional pill-based category filter (badge-pill component)
- Presence grid: 3-col responsive, 16-24px gap
- Each card: feature-card with activity preview, tags, category

### Detail (`/presences/[id]`)
- Back link "← Gallery"
- Presence name as display-md heading
- Full activity card showing:
  - Type badge (timeline-pill colored: Playing=green, Listening=purple, etc.)
  - State, details
  - Large image placeholder (or key name)
  - Buttons (if present)
- Apply section:
  - Code block with `rpc-tui mcp set_activity ...` command
  - "Copy" button (button-download style)
  - Note: "Paste this in your terminal to apply this presence to your Discord RPC"

## Terminal Command Generator

For each presence, generate a command:
```bash
rpc-tui mcp set_activity '{
  "name": "Engineering Reality with AI",
  "state": "Forging the unseen",
  "details": "TypeScript • Systems • Inference",
  "type": 0,
  "largeImageKey": "imagen"
}'
```

The command is formatted as JSON for the `set_activity` tool of the discord-rpc-tui MCP server. The user copies and pastes into their terminal where discord-rpc-tui is running.

## Theme / Design System

Color tokens as CSS custom properties:
```css
:root {
  --primary: #f54e00;
  --primary-active: #d04200;
  --ink: #26251e;
  --body: #5a5852;
  --body-strong: #26251e;
  --muted: #807d72;
  --hairline: #e6e5e0;
  --hairline-soft: #efeee8;
  --canvas: #f7f7f4;
  --canvas-soft: #fafaf7;
  --surface-card: #ffffff;
  --surface-strong: #e6e5e0;
  --on-primary: #ffffff;
  --timeline-thinking: #dfa88f;
  --timeline-edit: #c0a8dd;
  --timeline-done: #c08532;
  --semantic-success: #1f8a65;
}
```
