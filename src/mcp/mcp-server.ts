import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import type { RPCManager } from '../core/rpc-manager.js';
import type { ConfigManager } from '../core/config-manager.js';
import type { DiscordDetector } from '../core/discord-detector.js';
import {
  handleSetActivity,
  handleListProfiles,
  handleGetStatus,
  handleSetProfile,
  handleConnect,
  handleDisconnect,
} from './mcp-handlers.js';

export interface McpServerOptions {
  mode: 'stdio' | 'sse';
  port?: number;
}

// ── Server bootstrap ──

export async function startDiscordRpcMcpServer(
  rpcManager: RPCManager,
  configManager: ConfigManager,
  discordDetector: DiscordDetector,
  options: McpServerOptions,
): Promise<void> {
  const mcpServer = new McpServer(
    {
      name: 'discord-rpc-tui',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register tools with Zod schemas for input validation

  mcpServer.registerTool('set_activity', {
    description: 'Set Discord Rich Presence activity. ' +
      'Args: state, details, name, type (0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing), ' +
      'startTimestamp (true=elapsed, number=epoch ms), largeImageKey, largeImageText, ' +
      'smallImageKey, smallImageText, buttons (max 2, each with label+url)',
    inputSchema: z.object({
      state: z.string().optional(),
      details: z.string().optional(),
      name: z.string().optional(),
      type: z.number().int().min(0).max(5).optional(),
      startTimestamp: z.union([z.boolean(), z.number()]).optional(),
      largeImageKey: z.string().optional(),
      largeImageText: z.string().optional(),
      smallImageKey: z.string().optional(),
      smallImageText: z.string().optional(),
      buttons: z.array(z.object({ label: z.string(), url: z.string() })).max(2).optional(),
    }),
  }, async (args) => handleSetActivity(rpcManager, args as Record<string, unknown>));

  mcpServer.registerTool('list_profiles', {
    description: 'List available activity profiles from config',
    inputSchema: z.object({}),
  }, async () => handleListProfiles(configManager));

  mcpServer.registerTool('get_status', {
    description: 'Get current Discord RPC connection status, Discord availability, and profile info',
    inputSchema: z.object({}),
  }, async () => handleGetStatus(rpcManager, configManager, discordDetector));

  mcpServer.registerTool('set_profile', {
    description: 'Set activity from a named profile in config. Requires "name" parameter matching a profile name.',
    inputSchema: z.object({
      name: z.string().min(1, 'Profile name is required'),
    }),
  }, async (args) => handleSetProfile(rpcManager, configManager, args.name));

  mcpServer.registerTool('connect', {
    description: 'Connect to Discord RPC using configured client ID',
    inputSchema: z.object({}),
  }, async () => handleConnect(rpcManager, configManager));

  mcpServer.registerTool('disconnect', {
    description: 'Disconnect from Discord RPC',
    inputSchema: z.object({}),
  }, async () => handleDisconnect(rpcManager));

  // ── Transport ──

  if (options.mode === 'stdio') {
    const transport = new StdioServerTransport();
    console.error('[discord-rpc-mcp] Starting MCP server in stdio mode');
    await mcpServer.connect(transport);
  } else if (options.mode === 'sse') {
    const port = options.port ?? 3100;

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    const app = createMcpExpressApp();

    app.post('/mcp', async (req, res) => {
      await transport.handleRequest(req, res, req.body);
    });

    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', mode: 'mcp-sse', port });
    });

    await mcpServer.connect(transport);

    app.listen(port, () => {
      console.error(`[discord-rpc-mcp] MCP server running in SSE mode on http://localhost:${port}/mcp`);
    });

    // Keep alive until SIGINT/SIGTERM
    await new Promise<void>((resolve) => {
      const shutdown = async () => {
        console.error('[discord-rpc-mcp] Shutting down...');
        await mcpServer.close();
        await transport.close();
        await rpcManager.destroy();
        discordDetector.destroy();
        resolve();
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
  }
}
