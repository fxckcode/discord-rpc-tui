#!/usr/bin/env node

import { render } from 'ink';
import React from 'react';
import { App } from './app.js';
import { ConfigManager } from './core/config-manager.js';
import { RPCManager } from './core/rpc-manager.js';
import { DiscordDetector } from './core/discord-detector.js';
import { isRawModeSupported } from './core/raw-mode.js';
import { startDiscordRpcMcpServer } from './mcp/mcp-server.js';

// CLI argument parsing
const args = process.argv.slice(2);
const isMcpMode = args.includes('mcp');
const isSseMode = args.includes('--sse');
const portIndex = args.indexOf('--port');
const ssePort = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 3100;

if (isMcpMode) {
  // ── MCP Server mode ──
  const configManager = new ConfigManager();
  const rpcManager = new RPCManager();
  const discordDetector = new DiscordDetector();

  // Set up logging for MCP mode (to stderr so stdout stays clean for stdio transport)
  const log = (msg: string) => console.error(`[discord-rpc-mcp] ${msg}`);

  rpcManager.on('connected', () => log('Connected to Discord'));
  rpcManager.on('disconnected', () => log('Disconnected from Discord'));
  rpcManager.on('error', (err) => log(`Error: ${err.message}`));
  rpcManager.on('activity-set', (name) => log(`Activity set: ${name}`));
  rpcManager.on('status-change', (status) => log(`Status: ${status}`));

  discordDetector.on('discord-on', () => log('Discord detected'));
  discordDetector.on('discord-off', () => log('Discord closed'));
  discordDetector.startPolling();

  try {
    const config = await configManager.load();
    log(`Config loaded: ${config.profiles.length} profiles`);

    // Auto-connect to Discord
    rpcManager.connect(config.clientId).catch((err) => {
      log(`Connection failed: ${err.message} (will retry)`);
    });

    await startDiscordRpcMcpServer(
      rpcManager,
      configManager,
      discordDetector,
      { mode: isSseMode ? 'sse' : 'stdio', port: ssePort },
    );
  } catch (err) {
    console.error(`[discord-rpc-mcp] Fatal error: ${(err as Error).message}`);
    process.exit(1);
  }
} else {
  // ── TUI / Headless mode (existing behavior) ──
  const configManager = new ConfigManager();
  const rpcManager = new RPCManager();
  const discordDetector = new DiscordDetector();

  if (isRawModeSupported()) {
    // TUI mode
    const { waitUntilExit } = render(
      React.createElement(App, {
        configManager,
        rpcManager,
        discordDetector,
      }),
    );

    process.on('SIGINT', async () => {
      discordDetector.destroy();
      await rpcManager.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      discordDetector.destroy();
      await rpcManager.destroy();
      process.exit(0);
    });

    await waitUntilExit();
  } else {
    // Headless mode (no TTY)
    console.log('[rpc-tui] Starting in headless mode (no TTY detected)');

    const config = await configManager.load();
    console.log(`[rpc-tui] Config loaded: ${config.profiles.length} profiles`);

    rpcManager.on('connected', () => {
      console.log('[rpc-tui] Connected to Discord');
      // Set initial activity when connected
      if (config.profiles.length > 0) {
        rpcManager.setActivity(config.profiles[0].activity, config.profiles[0].name)
          .then(() => console.log(`[rpc-tui] Activity set: ${config.profiles[0].name}`))
          .catch((err) => console.error('[rpc-tui] Failed to set activity:', err.message));
      }
    });
    rpcManager.on('disconnected', () => console.log('[rpc-tui] Disconnected'));
    rpcManager.on('error', (err) => console.error('[rpc-tui] Error:', err.message));
    rpcManager.on('activity-set', (name) => console.log(`[rpc-tui] Activity set: ${name}`));

    discordDetector.on('discord-on', () => console.log('[rpc-tui] Discord detected'));
    discordDetector.on('discord-off', () => console.log('[rpc-tui] Discord closed'));
    discordDetector.startPolling();

    // Initial check
    if (!discordDetector.isDiscordRunning()) {
      console.log('[rpc-tui] Waiting for Discord...');
    }

    await rpcManager.connect(config.clientId);
    console.log('[rpc-tui] Service running');

    // Keep alive
    process.on('SIGINT', async () => {
      discordDetector.destroy();
      await rpcManager.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      discordDetector.destroy();
      await rpcManager.destroy();
      process.exit(0);
    });

    // Infinite wait
    await new Promise(() => {});
  }
}
