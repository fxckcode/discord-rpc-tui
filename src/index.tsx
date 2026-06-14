#!/usr/bin/env node

import { render } from 'ink';
import React from 'react';
import { execSync } from 'child_process';
import { App } from './app.js';
import type { ActivityConfig } from './types/index.js';
import { ConfigManager } from './core/config-manager.js';
import { RPCManager } from './core/rpc-manager.js';
import { DiscordDetector } from './core/discord-detector.js';
import { isRawModeSupported } from './core/raw-mode.js';
import { startDiscordRpcMcpServer } from './mcp/mcp-server.js';

// CLI argument parsing
const args = process.argv.slice(2);
const isSetActivity = args[0] === 'set-activity';
const isMcpMode = args.includes('mcp');
const isSseMode = args.includes('--sse');
const portIndex = args.indexOf('--port');
const ssePort = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 3100;

if (isSetActivity) {
  const configManager = new ConfigManager();

  let activityArg = args.slice(1).join(' ');
  let activity: ActivityConfig;

  if (!activityArg) {
    console.error('[rpc-tui] Usage: rpc-tui set-activity \'{"state": "...", "details": "..."}\'');
    process.exit(1);
  }

  try {
    activity = JSON.parse(activityArg);
  } catch {
    console.error('[rpc-tui] Invalid JSON for activity config');
    process.exit(1);
  }

  try {
    // Load config, update first profile, save
    const config = await configManager.load();
    if (config.profiles.length === 0) {
      config.profiles.push({ name: 'Custom', activity });
    } else {
      config.profiles[0] = { name: activity.name || 'Custom', activity };
    }
    await configManager.save(config);
    console.error('[rpc-tui] \u2714 Config updated');

    // Restart service so it picks up the new activity
    try {
      execSync('systemctl --user is-active discord-rpc-tui 2>/dev/null', { stdio: 'ignore' });
      console.error('[rpc-tui] Restarting service...');
      execSync('systemctl --user restart discord-rpc-tui', { stdio: 'ignore' });
      console.error('[rpc-tui] \u2714 Activity applied!');
    } catch {
      // Service not running — start it
      try {
        execSync('systemctl --user start discord-rpc-tui 2>/dev/null', { stdio: 'ignore' });
        console.error('[rpc-tui] \u2714 Service started with new activity');
      } catch {
        console.error('[rpc-tui] \u2714 Config saved (start the service to apply):');
        console.error('   systemctl --user start discord-rpc-tui');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(`[rpc-tui] Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

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

    // Configure repo button (auto-injected by RPCManager.setActivity)
    rpcManager.setRepoButtonConfig({
      showRepoButton: config.showRepoButton ?? true,
      repoUrl: config.repoUrl ?? 'https://github.com/fxckcode/discord-rpc-tui',
      repoButtonLabel: config.repoButtonLabel ?? 'View on GitHub',
    });

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

    // Configure repo button (auto-injected by RPCManager.setActivity)
    rpcManager.setRepoButtonConfig({
      showRepoButton: config.showRepoButton ?? true,
      repoUrl: config.repoUrl ?? 'https://github.com/fxckcode/discord-rpc-tui',
      repoButtonLabel: config.repoButtonLabel ?? 'View on GitHub',
    });

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
