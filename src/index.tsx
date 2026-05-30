#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import { App } from './app.js';
import { ConfigManager } from './core/config-manager.js';
import { RPCManager } from './core/rpc-manager.js';
import { DiscordDetector } from './core/discord-detector.js';

const configManager = new ConfigManager();
const rpcManager = new RPCManager();
const discordDetector = new DiscordDetector();

const { waitUntilExit } = render(
  React.createElement(App, {
    configManager,
    rpcManager,
    discordDetector,
  }),
);

// Handle graceful shutdown
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
