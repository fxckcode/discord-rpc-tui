# Archive: MCP Server para Discord RPC

## Summary
- **Proposal:** `.sdd/changes/mcp-server/proposal.md`
- **Spec:** `.sdd/changes/mcp-server/spec.md`
- **Tasks:** 3 tasks (scaffold, server, tests) — implementado directo
- **Verification:** PASS

## Files Changed
- `package.json` — agregadas dependencias: `@modelcontextprotocol/sdk`, `express`, `@types/express`
- `src/index.tsx` — modificado: dispatcher de subcomandos (`rpc-tui mcp`)
- `src/mcp/mcp-server.ts` — nuevo: servidor MCP con stdio + SSE
- `src/mcp/mcp-handlers.ts` — nuevo: handlers para los 6 tools MCP
- `src/tests/mcp-handlers.test.ts` — nuevo: 17 tests unitarios
- `src/core/rpc-manager.ts` — fix: constructor de Client (`transport: { type: 'ipc' }`)
- `src/app.tsx` — fix: `overflowY="auto"` → `overflowY="hidden"`

## CLI Interface
```
rpc-tui mcp                    # Start MCP server (stdio mode)
rpc-tui mcp --sse              # Start MCP server (SSE mode on port 3100)
rpc-tui mcp --sse --port 8080  # Start MCP server (SSE mode on custom port)
rpc-tui                        # TUI / headless (unchanged)
```

## MCP Tools
| Tool | Description |
|------|-------------|
| `set_activity` | Set RP with state, details, name, type, timestamps, images, buttons |
| `list_profiles` | List profiles from config |
| `get_status` | Connection status + Discord availability |
| `set_profile` | Activate profile by name |
| `connect` | Connect to Discord RPC |
| `disconnect` | Disconnect from Discord RPC |

## What Was Learned
- MCP SDK v1.x usa `McpServer` (high-level API) con `registerTool()` + Zod schemas para validación
- `StreamableHTTPServerTransport` requiere `Mcp-Session-Id` header para sesiones stateful
- El MCP SDK convierte automáticamente Zod schemas a JSON Schema draft-07
- El modo stdio es simple y funciona directo con pipes stdin/stdout
- El modo SSE necesita Express + `createMcpExpressApp()` para seguridad DNS rebinding

## Next Steps
- Configurar Hermes Agent para usar el MCP como herramienta nativa
- Agregar autenticación opcional para modo SSE
- Documentar en README el uso del MCP server
