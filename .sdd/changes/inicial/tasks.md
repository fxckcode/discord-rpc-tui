# Tasks: Discord Rich Presence TUI

## Dependency Order
T1 ← T2 ← T3 ← T4 ← T5

## Tasks

### T1: Scaffold + Core Layer (RPC Manager + Config Manager) (AFK)
- **Files:** `package.json`, `tsconfig.json`, `tsup.config.ts`, `.env.example`, `src/core/rpc-manager.ts`, `src/core/config-manager.ts`, `src/types/index.ts`, `src/core/discord-detector.ts`
- **Acceptance:** 
  - RPC Manager connects to Discord, sets activity, auto-reconnects
  - Config Manager reads/writes JSON with Zod validation
  - Discord Detector detects if Discord is running
  - `pnpm build` compiles sin errores
  - Tests pasan
- **Dependencies:** ninguna
- **Size:** large

### T2: Ink TUI Base (StatusBar + Layout) (AFK)
- **Files:** `src/index.tsx`, `src/app.tsx`, `src/components/status-bar.tsx`
- **Acceptance:** 
  - TUI renders with StatusBar showing connection status
  - Keybinding q=quit funciona
  - Keyboard input handling works
  - `pnpm start` muestra la TUI
- **Dependencies:** T1
- **Size:** medium

### T3: TUI Components (ActivityEditor + ProfileList + LogPanel) (AFK)
- **Files:** `src/components/activity-editor.tsx`, `src/components/profile-list.tsx`, `src/components/log-panel.tsx`
- **Acceptance:**
  - ActivityEditor muestra state, details, buttons actuales
  - ProfileList muestra perfiles y permite seleccionar
  - LogPanel muestra eventos RPC
  - Keybindings: Space=pause, n=next, r=reload
- **Dependencies:** T2
- **Size:** large

### T4: Activity Rotator + systemd Service (AFK)
- **Files:** `src/core/activity-rotator.ts`, `systemd/discord-rpc-tui.service`
- **Acceptance:**
  - Actividades rotan cada N segundos
  - systemd service arranca al login y mantiene vivo
  - `systemctl --user start discord-rpc-tui` funciona
- **Dependencies:** T3
- **Size:** medium

### T5: Polish + Docs + GitHub Setup (AFK)
- **Files:** `README.md`, `CONTEXT.md`, `.gitignore`, `LICENSE`, `docs/config-guide.md`, `.github/workflows/ci.yml`
- **Acceptance:** README completo, docs de configuración, CI pipeline, git-setup-skill audit
- **Dependencies:** T4
- **Size:** medium
