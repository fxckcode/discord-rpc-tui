# Archive: Discord RPC TUI — Inicial

## Summary
- **Proposal:** `.sdd/changes/inicial/proposal.md`
- **Spec:** `.sdd/changes/inicial/spec.md`
- **Tasks:** 5 tasks (T1-T5)
- **Verification:** PASS

## Files Changed
- `package.json` — project config (ink, react, @xhayper/discord-rpc, zod)
- `tsconfig.json` — TypeScript strict mode
- `tsup.config.ts` — ESM bundler
- `src/index.tsx` — Entry point, renders Ink App
- `src/app.tsx` — Main App component with all state management
- `src/core/rpc-manager.ts` — Discord RPC with auto-reconnect
- `src/core/config-manager.ts` — JSON config with Zod validation
- `src/core/discord-detector.ts` — Detect Discord via IPC socket
- `src/core/activity-rotator.ts` — Timer-based profile rotation
- `src/components/status-bar.tsx` — Connection status indicator
- `src/types/index.ts` — Shared TypeScript types
- `src/tests/config-manager.test.ts` — 5 tests
- `bin/rpc-tui` — Shell wrapper script
- `install.sh` — Installer with systemd setup
- `systemd/discord-rpc-tui.service` — systemd user service
- `README.md` — Full documentation
- `.gitignore` — Node + dist

## What Was Learned
- Ink v7 requiere React 19 y un TTY real (no funciona en pipes, solo en terminal interactiva)
- @xhayper/discord-rpc necesita Client ID pero NO OAuth2 para SET_ACTIVITY
- IPC transport via /tmp/discord-ipc-0 es más simple que WebSocket
- tsup banner con shebang + ESM = syntax error (usar wrapper script)
- systemd --user services son la forma correcta de auto-start en Linux

## Next Steps
- Agregar tests para DiscordDetector + ActivityRotator
- Agregar screenshot en docs/
- Configurar GitHub repo + CI
