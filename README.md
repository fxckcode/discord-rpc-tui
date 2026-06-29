# RPCraft

**Craft your Discord Presence** — CLI, TUI, web gallery, and MCP server for Discord Rich Presence.

## Features

- 🎨 **Beautiful TUI** — built with Ink (React), full keyboard navigation
- 🔄 **Activity Rotation** — set multiple profiles that rotate automatically
- 🔗 **Auto-reconnect** — survives Discord restarts with exponential backoff
- 📋 **Rich Presence** — state, details, timestamps, buttons (max 2), images via asset keys or external URLs (static PNG/JPEG — Discord CDN strips GIF animation)
- 🌐 **Presence Gallery** — browse and apply beautiful presences at [rpcraft.sh](https://rpcraft.sh)
- 🤖 **MCP Server** — Model Context Protocol server for agent CLI integration (Hermes Agent, Claude Code, Codex CLI)
- ⚙️ **Configurable** — JSON config at `~/.config/rpcraft/config.json`
- 🚀 **Auto-start** — systemd user service

## Quick Start

### 1. Install

```bash
git clone https://github.com/fxckcode/discord-rpc-tui.git
cd discord-rpc-tui
pnpm install
bash install.sh
```

### 2. Configure

Edit `~/.config/rpcraft/config.json`:

```json
{
  "clientId": "YOUR_CLIENT_ID_HERE",
  "profiles": [
    {
      "name": "Coding",
      "activity": {
        "state": "Building RPCraft",
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
~/.local/share/rpcraft/bin/rpc-tui

# Or as a service (auto-start)
systemctl --user start rpcraft
```

## Keybindings

| Key | Action |
|-----|--------|
| `q` | Quit |
| `Space` | Pause/resume RPC |
| `n` | Next activity profile |
| `r` | Reload config |

## Presence Gallery

Browse a curated gallery of Rich Presences and apply them with one click:

👉 **[rpcraft.sh](https://rpcraft.sh)**

Each presence includes ready-to-use config snippets for your `~/.config/rpcraft/config.json`.

## MCP Server

`rpc-tui` includes a [Model Context Protocol](https://modelcontextprotocol.io) server for AI agent integration.

### Usage

```bash
# Stdio mode (for CLI agents)
rpc-tui mcp

# SSE mode (for HTTP clients)
rpc-tui mcp --sse --port 3100
```

### Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `set_activity` | Set custom Rich Presence | `state`, `details`, `name`, `type`, `startTimestamp`, `largeImageKey`, `largeImageUrl`, `largeImageText`, `smallImageKey`, `smallImageUrl`, `smallImageText`, `buttons[]` |
| `list_profiles` | List profiles from config | _(none)_ |
| `get_status` | Get connection + Discord status | _(none)_ |
| `set_profile` | Activate a profile by name | `name` (required) |
| `connect` | Connect to Discord RPC | _(none)_ |
| `disconnect` | Disconnect from Discord RPC | _(none)_ |
| `open_dev_portal` | Open Dev Portal to upload images | _(none)_ |

## Config File

Located at `~/.config/rpcraft/config.json`:

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
        "largeImageText": "Zelda TOTK",
        "type": 0,
        "startTimestamp": true,
        "buttons": [{ "label": "Watch Stream", "url": "https://twitch.tv/..." }]
      }
    }
  ],
  "rotationInterval": 600,
  "showRepoButton": true,
  "repoUrl": "https://github.com/fxckcode/discord-rpc-tui",
  "repoButtonLabel": "⭐ View on GitHub"
}
```

### Images — Asset Keys vs External URLs

You have two ways to set images in your Rich Presence:

| Method | Field | Source | Animated |
|--------|-------|--------|:---:|
| **Asset Key** | `largeImageKey` / `smallImageKey` | Upload to [Discord Developer Portal](https://discord.com/developers/applications) → Rich Presence → Art Assets | ❌ |
| **External URL** | `largeImageUrl` / `smallImageUrl` | Any public HTTPS URL (GitHub, Imgur, your own server, etc.) | ❌ |

> **⚠️ Limitation:** Discord's CDN proxy processes all external images and strips animation from GIFs. Only static PNG/JPEG/WebP images will display correctly. This is a Discord limitation — not a bug in RPCraft. Even tools like [Vencord CustomRPC](https://vencord.dev/plugins/CustomRPC) only use application assets, not external URLs.

**Asset Key (static only)** — upload PNG/JPEG to Discord's Developer Portal under Rich Presence → Art Assets. Reference the asset by its name (lowercase, no extension):
```json
"largeImageKey": "my_asset_name"
```

**External URL (static PNG/JPEG recommended)** — host your image anywhere and paste the URL. Supported formats: **jpg, png, webp**. For best results use images under 1024×1024 and under 1MB:
```json
"largeImageUrl": "https://example.com/my-image.png"
```

## Architecture

```
src/
├── index.tsx              # Entry — renders Ink app
├── app.tsx                # Main App component
├── mcp/
│   ├── mcp-handlers.ts    # MCP tool handlers
│   └── mcp-server.ts      # MCP server bootstrap
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
pnpm start      # Start the TUI
```

## systemd

```bash
systemctl --user start   rpcraft
systemctl --user stop    rpcraft
systemctl --user enable  rpcraft
journalctl --user -u rpcraft -f
```

## License

MIT
