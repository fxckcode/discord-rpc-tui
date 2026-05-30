#!/usr/bin/env bash
set -euo pipefail

echo "=== Discord RPC TUI Installer ==="

# Build
echo "Building..."
pnpm build

# Install binary
INSTALL_DIR="${HOME}/.local/share/discord-rpc-tui"
BIN_DIR="${INSTALL_DIR}/bin"
mkdir -p "$BIN_DIR"
cp dist/index.js "$INSTALL_DIR/rpc-tui.js"
cp bin/rpc-tui "$BIN_DIR/rpc-tui"
chmod +x "$BIN_DIR/rpc-tui"
echo "Binary installed to: $BIN_DIR/rpc-tui"

# Create config if not exists
CONFIG_DIR="${HOME}/.config/discord-rpc-tui"
if [ ! -f "$CONFIG_DIR/config.json" ]; then
  mkdir -p "$CONFIG_DIR"
  cat > "$CONFIG_DIR/config.json" << 'CONFIG'
{
  "clientId": "YOUR_CLIENT_ID_HERE",
  "transport": "ipc",
  "rotationInterval": 600,
  "profiles": [
    {
      "name": "Coding",
      "activity": {
        "state": "Building something cool",
        "details": "TypeScript | Ink TUI",
        "startTimestamp": true,
        "type": 0
      }
    },
    {
      "name": "Idle",
      "activity": {
        "state": "AFK",
        "details": "Away from keyboard",
        "type": 0
      }
    }
  ]
}
CONFIG
  echo "Default config created at: $CONFIG_DIR/config.json"
  echo "⚠️  Edit the file to set your Discord Client ID"
else
  echo "Config already exists at: $CONFIG_DIR/config.json"
fi

# Install systemd service
SYSTEMD_DIR="${HOME}/.config/systemd/user"
mkdir -p "$SYSTEMD_DIR"
cp systemd/discord-rpc-tui.service "$SYSTEMD_DIR/"
systemctl --user daemon-reload
echo "Systemd service installed"

# Ask about auto-start
read -rp "Start on login? (Y/n): " START_ON_LOGIN
if [ "$START_ON_LOGIN" != "n" ] && [ "$START_ON_LOGIN" != "N" ]; then
  systemctl --user enable discord-rpc-tui
  echo "Service enabled for auto-start on login"
fi

# Ask about starting now
read -rp "Start now? (Y/n): " START_NOW
if [ "$START_NOW" != "n" ] && [ "$START_NOW" != "N" ]; then
  systemctl --user start discord-rpc-tui
  echo "Service started"
fi

echo ""
echo "=== Installation complete ==="
echo "Commands:"
echo "  systemctl --user start   discord-rpc-tui   # Start now"
echo "  systemctl --user stop    discord-rpc-tui   # Stop"
echo "  systemctl --user enable  discord-rpc-tui   # Auto-start on login"
echo "  journalctl --user -u discord-rpc-tui -f    # View logs"
echo ""
echo "Edit your config: $CONFIG_DIR/config.json"
echo "Set your Discord Client ID and custom profiles!"
