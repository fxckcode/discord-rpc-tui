# Proposal: Discord Rich Presence TUI con Ink

## Intent
Custom Rich Presence server para Discord con interfaz TUI en Ink (React para terminal), que se inicia automáticamente al arrancar el sistema.

## Scope
### In
- [x] TUI con Ink (React terminal) — StatusBar, ActivityEditor, ProfileList, LogPanel
- [x] Conexión RPC via @xhayper/discord-rpc con reconexión automática
- [x] Múltiples perfiles de actividad con rotación programada
- [x] Config en ~/.config/discord-rpc-tui/config.json (Zod validated)
- [x] Keybindings: q=salir, Space=pausar, n=siguiente, r=recargar
- [x] Detección de Discord (monitoreo de /tmp/discord-ipc-0)
- [x] systemd user service para auto-start al login
- [x] Soporte para: state, details, timestamps, buttons, type, imágenes

### Out
- [ ] GUI/Electron (solo TUI)
- [ ] Soporte Windows/Mac (solo Linux por ahora)
- [ ] Traducciones
- [ ] OAuth2 flow completo (no necesario para SET_ACTIVITY)
- [ ] Integración con Spotify/YouTube (solo RPC manual)

## Approach
### Arquitectura
```
src/
├── index.tsx              # Entry point, render Ink app
├── app.tsx                # Main Ink component, layout
├── core/
│   ├── rpc-manager.ts     # Discord RPC connection (connect, setActivity, reconnect)
│   ├── config-manager.ts  # JSON config read/write con Zod
│   ├── activity-rotator.ts# Timer-based activity rotation
│   └── discord-detector.ts# Detect if Discord is running via /tmp/discord-ipc-0
├── components/
│   ├── status-bar.tsx     # Connection status, elapsed time, Discord status
│   ├── activity-editor.tsx# Edit current activity (state, details, buttons)
│   ├── profile-list.tsx   # Select/switch between profiles
│   └── log-panel.tsx      # RPC event log
└── types/
    └── index.ts           # Shared types (Profile, Config, ActivityStatus)
```

## Modules Affected
- Proyecto nuevo

## Risks
- Discord RPC IPC puede fallar si Discord no está abierto → reconexión automática
- Ink v7 usa React 19, puede tener breaking changes → pin versiones
- @xhayper/discord-rpc puede tener cambios en API → wrapper propio

## Skill Resolution
- skills: opencode (para implementar en paralelo)
