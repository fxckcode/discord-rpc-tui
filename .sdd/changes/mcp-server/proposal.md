# Proposal: MCP Server para Discord RPC

## Intent
Agregar un servidor MCP (Model Context Protocol) a discord-rpc-tui que permita a agentes CLI (Hermes Agent, Claude Code, etc.) y otras apps cambiar el Rich Presence de Discord vía herramientas MCP.

## Scope

### In
- [x] Servidor MCP con **stdio transport** (modo principal para agentes CLI)
- [x] Servidor MCP con **SSE transport** opcional (para apps HTTP)
- [x] Herramientas MCP: `set_activity`, `list_profiles`, `get_status`, `set_profile`, `connect`, `disconnect`
- [x] Nuevo subcomando `rpc-tui mcp` que inicia el servidor MCP
- [x] Integración con `RPCManager` y `ConfigManager` existentes
- [x] Tests unitarios para MCP handlers
- [x] Dependencias: `@modelcontextprotocol/sdk`, `express` (SSE)

### Out
- [ ] No modificar el modo TUI existente
- [ ] No modificar el modo headless existente
- [ ] No modificar systemd service (se puede agregar después)
- [ ] No autenticación para stdio (el acceso local es implícito)
- [ ] No cambiar el schema del config existente

## Approach
1. Crear `src/mcp/` con `mcp-server.ts` (servidor MCP con stdio + SSE) y `mcp-handlers.ts` (definiciones y handlers de tools)
2. Modificar `src/index.tsx` para que cuando se ejecute como `rpc-tui mcp` inicie el servidor MCP
3. Actualizar tsup.config.ts para exponer entry point adicional si es necesario
4. Agregar tests para handlers MCP

## Modules Affected
- `src/mcp/mcp-server.ts` — nuevo: servidor MCP
- `src/mcp/mcp-handlers.ts` — nuevo: tool definitions + handlers
- `src/index.tsx` — modificar: dispatcher de subcomandos
- `package.json` — modificar: nuevas dependencias
- `src/types/index.ts` — modificar si se necesitan nuevos tipos
- `src/tests/mcp-handlers.test.ts` — nuevo: tests

## Risks
- **MCP SDK API puede cambiar** → anclar versión específica
- **MCP stdio y el modo headless compiten** → asegurar que `rpc-tui mcp` sea mutuamente exclusivo
- **Timeout en setActivity si Discord no está corriendo** → el MCP handler debe devolver error claro
- **Múltiples entry points con tsup** → verificar que tsup pueda emitir dos bundles

## Skill Resolution
- `native-mcp` — para entender el protocolo MCP
- El SDD ref `nestjs-mcp-sse-server.md` tiene patrones de MCP que adaptaremos a Node.js plano
