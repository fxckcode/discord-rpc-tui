#!/usr/bin/env bash
set -euo pipefail

echo "=== Discord RPC TUI Installer ==="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="${HOME}/.local/share/discord-rpc-tui"
BIN_DIR="${INSTALL_DIR}/bin"

# Build
echo "Building..."
cd "$SCRIPT_DIR"
pnpm build

# Install files
mkdir -p "$BIN_DIR"
cp -r dist "$INSTALL_DIR/"
cp package.json pnpm-lock.yaml "$INSTALL_DIR/" 2>/dev/null || true

# Install production dependencies in the install dir (needed for externals like @modelcontextprotocol/sdk)
if command -v pnpm &>/dev/null; then
  echo "Installing production dependencies..."
  cd "$INSTALL_DIR" && pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod 2>/dev/null || true
elif command -v npm &>/dev/null; then
  cd "$INSTALL_DIR" && npm install --omit=dev 2>/dev/null || true
fi
cd "$SCRIPT_DIR"

# Create wrapper (points to INSTALL_DIR — survives deleting the clone)
cat > "$BIN_DIR/rpc-tui" << WRAPPER
#!/usr/bin/env bash
set -euo pipefail
if [ -d "${HOME}/.hermes/node/bin" ]; then
  export PATH="${HOME}/.hermes/node/bin:\${PATH}"
fi
cd "$INSTALL_DIR"
exec node dist/index.js "\$@"
WRAPPER
chmod +x "$BIN_DIR/rpc-tui"
echo "Binary installed to: $BIN_DIR/rpc-tui"

# Add to PATH for current and future shells
case "$SHELL" in
  *fish)
    fish -c "set -U fish_user_paths $BIN_DIR \$fish_user_paths" 2>/dev/null && echo "Added to fish PATH (universal)" || true
    ;;
  *zsh)
    if ! grep -q "$BIN_DIR" "$HOME/.zshrc" 2>/dev/null; then
      echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.zshrc"
      echo "Added to ~/.zshrc"
    fi
    ;;
  *)
    if ! grep -q "$BIN_DIR" "$HOME/.bashrc" 2>/dev/null; then
      echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.bashrc"
      echo "Added to ~/.bashrc"
    fi
    ;;
esac

# Add to current session
export PATH="$PATH:$BIN_DIR"

# Create default config
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
      "name": "My Presence",
      "activity": {
        "state": "Doing something cool",
        "details": "TypeScript · Systems",
        "type": 0
      }
    }
  ]
}
CONFIG
  echo "Config created at: $CONFIG_DIR/config.json"
  echo "⚠️  Edit it and set your Discord Client ID!"
else
  echo "Config already exists at: $CONFIG_DIR/config.json"
fi

# Systemd service (Linux only)
if [[ "$(uname)" == "Linux" ]] && command -v systemctl &>/dev/null && [ -f "$SCRIPT_DIR/systemd/discord-rpc-tui.service" ]; then
  SYSTEMD_DIR="${HOME}/.config/systemd/user"
  mkdir -p "$SYSTEMD_DIR"
  cp "$SCRIPT_DIR/systemd/discord-rpc-tui.service" "$SYSTEMD_DIR/"
  systemctl --user daemon-reload
  echo "Systemd service installed"

  read -rp "Start on login? (Y/n): " START_ON_LOGIN
  if [ "$START_ON_LOGIN" != "n" ] && [ "$START_ON_LOGIN" != "N" ]; then
    systemctl --user enable discord-rpc-tui
    echo "Auto-start enabled"
  fi

  read -rp "Start now? (Y/n): " START_NOW
  if [ "$START_NOW" != "n" ] && [ "$START_NOW" != "N" ]; then
    systemctl --user start discord-rpc-tui
    echo "Service started"
  fi
else
  echo "ℹ️  Auto-start not configured (no systemd found)"
  echo "   Start manually: rpc-tui mcp"
fi

echo ""
echo "=== Installation complete ==="
echo ""
echo "  rpc-tui mcp       # Start MCP server"
echo "  rpc-tui            # Launch TUI"
echo "  rpc-tui --help     # Show help"
echo ""
echo "Config: $CONFIG_DIR/config.json"
echo ""
echo "⚠️  Open a new terminal or restart your shell to use 'rpc-tui'"
