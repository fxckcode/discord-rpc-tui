# Tasks: MCP Server para Discord RPC

## Dependency Order
T1 ← T2 ← T3 (T3 depende de T2 que depende de T1)

## Tasks

### T1: Scaffold + Dependencies + MCP Handlers (AFK)
**Description:** Crear `src/mcp/` con la lógica de herramientas MCP y actualizar dependencias.
- **Files:**
  - `package.json` — agregar `@modelcontextprotocol/sdk` y `express`
  - `src/mcp/mcp-handlers.ts` — nuevo: definiciones de tools + handlers
  - `src/types/index.ts` — agregar tipo `McpToolDefinition`
- **Acceptance:**
  - `pnpm install` exitoso
  - `src/mcp/mcp-handlers.ts` existe con tool definitions para los 6 tools del spec
  - Los handlers usan interfaces `RPCManager` y `ConfigManager` sin acoplarse a implementaciones concretas
- **Size:** medium
- **Dependencies:** none

### T2: MCP Server (AFK)
**Description:** Crear el servidor MCP con soporte stdio + SSE y el dispatcher de subcomandos en el entry point.
- **Files:**
  - `src/mcp/mcp-server.ts` — nuevo: servidor MCP con stdio/SSE
  - `src/index.tsx` — modificar: detectar args `mcp`, `--sse`, `--port` y delegar
  - `src/app.tsx` — no tocar (confirmar)
  - `tsup.config.ts` — modificar si necesitamos entry point separado
- **Acceptance:**
  - `rpc-tui mcp` inicia servidor MCP en modo stdio
  - `rpc-tui mcp --sse` inicia en modo SSE en puerto 3100
  - `rpc-tui mcp --sse --port 8080` inicia en puerto 8080
  - `rpc-tui` sin args sigue funcionando como TUI/headless
- **Size:** medium
- **Dependencies:** T1

### T3: Tests (AFK)
**Description:** Tests unitarios para MCP handlers.
- **Files:**
  - `src/tests/mcp-handlers.test.ts` — nuevo
- **Acceptance:**
  - Test para cada tool handler
  - Tests para errores (no conectado, perfil no encontrado)
  - `pnpm test` pasa (37 + N tests)
- **Size:** small
- **Dependencies:** T1, T2 (need actual classes)
