# Discord RPC TUI

**Custom Discord Rich Presence manager** — a beautiful Terminal UI built with [Ink](https://github.com/vadimdemedes/ink) (React for terminal) that sets custom activities on your Discord profile.

![TUI Screenshot](docs/screenshot.png)

## Features

- 🎨 **Beautiful TUI** — built with Ink (React), full keyboard navigation
- 🔄 **Activity Rotation** — set multiple profiles that rotate automatically
- 🔗 **Auto-reconnect** — survives Discord restarts with exponential backoff
- 📋 **Rich Presence** — state, details, timestamps, buttons (max 2), images, activity type
- ⚙️ **Configurable** — JSON config at `~/.config/discord-rpc-tui/config.json`
- 🚀 **Auto-start** — systemd user service, starts when you log in
- 🔍 **Discord Detection** — automatically pauses when Discord is closed

## Quick Start

### 1. Install
```bash
git clone https://github.com/fxckcode/discord-rpc-tui.git
cd discord-rpc-tui
pnpm install
bash install.sh
```

### 2. Configure
Edit `~/.config/discord-rpc-tui/config.json`:

```json
{
  "clientId": "YOUR_CLIENT_ID_HERE",
  "profiles": [
    {
      "name": "Coding",
      "activity": {
        "state": "Building Discord RPC TUI",
        "details": "TypeScript • Ink",
        "startTimestamp": true,
        "type": 0
      }
    }
  ]
}
```

### 3. Get a Client ID
1. Go to https://discord.com/developers/applications
2. Create **New Application**
3. Copy the **Client ID** (snowflake number)
4. Paste it into your config

### 4. Run
```bash
# Run manually (TUI)
~/.local/share/discord-rpc-tui/bin/rpc-tui

# Or as a service (auto-start)
systemctl --user start discord-rpc-tui
```

## Keybindings

| Key | Action |
|-----|--------|
| `q` | Quit |
| `Space` | Pause/resume RPC |
| `n` | Next activity profile |
| `r` | Reload config |

## Config File

Located at `~/.config/discord-rpc-tui/config.json`:

```json
{
  "clientId": "123456789012345678",
  "transport": "ipc",
  "profiles": [
    {
      "name": "Playing",
      "activity": {
        "state": "Exploring Hyrule",
        "details": "Zelda: Tears of the Kingdom",
        "largeImageKey": "zelda",
        "type": 0,
        "startTimestamp": true,
        "buttons": [{ "label": "Watch Stream", "url": "https://twitch.tv/..." }]
      }
    }
  ],
  "rotationInterval": 600
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `clientId` | string | Discord Application ID (required) |
| `transport` | "ipc" \| "websocket" | RPC transport (default: ipc) |
| `rotationInterval` | number | Seconds between profile rotation (0 = no rotation) |
| `profiles[]` | array | Array of activity profiles |
| `profiles[].name` | string | Profile display name |
| `profiles[].activity.state` | string | Line 1 of rich presence |
| `profiles[].activity.details` | string | Line 2 of rich presence |
| `profiles[].activity.startTimestamp` | boolean \| number | true = elapsed, number = epoch ms |
| `profiles[].activity.endTimestamp` | number | Countdown timer (epoch ms) |
| `profiles[].activity.type` | number | 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing |
| `profiles[].activity.largeImageKey` | string | Large image asset key |
| `profiles[].activity.largeImageText` | string | Large image tooltip |
| `profiles[].activity.smallImageKey` | string | Small image asset key |
| `profiles[].activity.smallImageText` | string | Small image tooltip |
| `profiles[].activity.buttons[]` | array | Max 2 buttons with label + url |

## Architecture

```
src/
├── index.tsx              # Entry — renders Ink app
├── app.tsx                # Main App component
├── core/
│   ├── rpc-manager.ts     # Discord RPC (connect, activity, reconnect)
│   ├── config-manager.ts  # Config (read/write/validate with Zod)
│   ├── discord-detector.ts# Detect Discord via /tmp/discord-ipc-0
│   └── activity-rotator.ts# Timer-based profile rotation
├── components/
│   └── status-bar.tsx     # Connection status
└── types/
    └── index.ts           # TypeScript types
```

## Development

```bash
pnpm dev        # Watch mode
pnpm build      # Production build
pnpm test       # Run tests
pnpm start      # Start the TUI (after build)
```

## systemd

```bash
# Manual service control
systemctl --user start   discord-rpc-tui
systemctl --user stop    discord-rpc-tui
systemctl --user enable  discord-rpc-tui  # auto-start on login
journalctl --user -u discord-rpc-tui -f    # view logs
```

## License

MIT
