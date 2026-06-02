# Spec: MCP Server para Discord RPC

## Requirements

### Functional
- [x] REQ-F1: Servidor MCP con stdio transport (modo por defecto)
- [x] REQ-F2: Servidor MCP con SSE transport (modo `--sse --port`)
- [x] REQ-F3: Tool `set_activity` — establecer actividad personalizada
- [x] REQ-F4: Tool `list_profiles` — listar perfiles de la configuración
- [x] REQ-F5: Tool `get_status` — obtener estado de conexión
- [x] REQ-F6: Tool `set_profile` — activar un perfil por nombre
- [x] REQ-F7: Tool `connect` — conectar a Discord RPC
- [x] REQ-F8: Tool `disconnect` — desconectar de Discord RPC
- [x] REQ-F9: Subcomando `rpc-tui mcp` para iniciar servidor
- [x] REQ-F10: Flags `--sse` (usar HTTP SSE en vez de stdio) y `--port` (puerto SSE, default 3100)

### Non-Functional
- [x] REQ-NF1: Los módulos TUI y headless existentes no deben romperse
- [x] REQ-NF2: Tests pasan antes y después del cambio
- [x] REQ-NF3: El MCP server reusa `RPCManager` y `ConfigManager` existentes

## Scenarios

### Happy Path: Agent CLI cambia actividad
1. User llama `rpc-tui mcp` desde Hermes Agent vía stdio MCP
2. MCP server inicia, carga config, conecta a Discord
3. Agent llama `set_activity({ state: "Coding", details: "MCP server" })`
4. MCP handler llama `RPCManager.setActivity()`
5. Discord muestra el nuevo Rich Presence
6. MCP devuelve `{ success: true }`

### Happy Path: Listar perfiles
1. Agent llama `list_profiles()`
2. MCP handler lee config vía ConfigManager
3. Devuelve array de perfiles con nombres y actividades

### Error: Discord no está corriendo
1. Agent llama `set_activity()`
2. RPCManager no está conectado
3. MCP handler devuelve error claro

## Interface Changes

### MCP Tools

#### `set_activity`
```typescript
{
  name: 'set_activity',
  description: 'Set Discord Rich Presence activity',
  inputSchema: {
    type: 'object',
    properties: {
      state: { type: 'string', description: 'Line 1 of rich presence' },
      details: { type: 'string', description: 'Line 2 of rich presence' },
      name: { type: 'string', description: 'Game/app name shown as "Playing {name}"' },
      type: { type: 'number', description: '0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing' },
      startTimestamp: { type: ['boolean', 'number'], description: 'true=elapsed, number=epoch ms' },
      largeImageKey: { type: 'string' },
      largeImageText: { type: 'string' },
      buttons: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, url: { type: 'string' } } }, maxItems: 2 }
    }
  }
}
```

#### `list_profiles`
```typescript
{
  name: 'list_profiles',
  description: 'List available activity profiles from config',
  inputSchema: { type: 'object', properties: {} }
}
// Returns: { profiles: [{ name: string, activity: ActivityConfig }] }
```

#### `get_status`
```typescript
{
  name: 'get_status',
  description: 'Get current Discord RPC connection status',
  inputSchema: { type: 'object', properties: {} }
}
// Returns: { status: ConnectionStatus, discordOnline: boolean, currentProfile?: string }
```

#### `set_profile`
```typescript
{
  name: 'set_profile',
  description: 'Set activity from a named profile in config',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Profile name to activate' }
    },
    required: ['name']
  }
}
```

#### `connect`
```typescript
{
  name: 'connect',
  description: 'Connect to Discord RPC',
  inputSchema: { type: 'object', properties: {} }
}
```

#### `disconnect`
```typescript
{
  name: 'disconnect',
  description: 'Disconnect from Discord RPC',
  inputSchema: { type: 'object', properties: {} }
}
```

### CLI Interface
```
rpc-tui mcp                      # Start MCP server (stdio mode)
rpc-tui mcp --sse                # Start MCP server (SSE mode on default port 3100)
rpc-tui mcp --sse --port 8080    # Start MCP server (SSE mode on custom port)
```
