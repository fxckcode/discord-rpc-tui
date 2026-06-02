import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { RPCManager } from '../core/rpc-manager.js';
import type { ConfigManager } from '../core/config-manager.js';
import type { DiscordDetector } from '../core/discord-detector.js';
import type { ActivityConfig } from '../types/index.js';

export function textResult(text: string): CallToolResult {
  return { content: [{ type: 'text' as const, text }] };
}

export function errorResult(error: string): CallToolResult {
  return { content: [{ type: 'text' as const, text: error }], isError: true };
}

export async function handleSetActivity(
  rpcManager: RPCManager,
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  if (rpcManager.status !== 'connected') {
    return errorResult('Not connected to Discord. Call connect() first.');
  }

  const activity: ActivityConfig = {};

  if (typeof args.state === 'string') activity.state = args.state;
  if (typeof args.details === 'string') activity.details = args.details;
  if (typeof args.name === 'string') activity.name = args.name;
  if (typeof args.type === 'number') activity.type = args.type as ActivityConfig['type'];
  if (typeof args.startTimestamp === 'boolean' || typeof args.startTimestamp === 'number') {
    activity.startTimestamp = args.startTimestamp;
  }
  if (typeof args.largeImageKey === 'string') activity.largeImageKey = args.largeImageKey;
  if (typeof args.largeImageText === 'string') activity.largeImageText = args.largeImageText;
  if (typeof args.largeImageUrl === 'string') activity.largeImageUrl = args.largeImageUrl;
  if (typeof args.smallImageKey === 'string') activity.smallImageKey = args.smallImageKey;
  if (typeof args.smallImageText === 'string') activity.smallImageText = args.smallImageText;
  if (typeof args.smallImageUrl === 'string') activity.smallImageUrl = args.smallImageUrl;
  if (Array.isArray(args.buttons)) {
    activity.buttons = (args.buttons as { label: string; url: string }[]).slice(0, 2);
  }

  try {
    await rpcManager.setActivity(activity, 'mcp');
    return textResult('Activity set successfully');
  } catch (err) {
    return errorResult(`Failed to set activity: ${(err as Error).message}`);
  }
}

export async function handleListProfiles(configManager: ConfigManager): Promise<CallToolResult> {
  try {
    const config = await configManager.load();
    const profiles = config.profiles.map((p) => ({
      name: p.name,
      activity: p.activity,
    }));
    return textResult(JSON.stringify({ profiles }, null, 2));
  } catch (err) {
    return errorResult(`Failed to load profiles: ${(err as Error).message}`);
  }
}

export async function handleGetStatus(
  rpcManager: RPCManager,
  configManager: ConfigManager,
  discordDetector: DiscordDetector,
): Promise<CallToolResult> {
  const config = await configManager.load().catch(() => null);
  return textResult(
    JSON.stringify(
      {
        status: rpcManager.status,
        discordOnline: discordDetector.isDiscordRunning(),
        currentProfile: config?.profiles[0]?.name ?? null,
        profileCount: config?.profiles.length ?? 0,
      },
      null,
      2,
    ),
  );
}

export async function handleSetProfile(
  rpcManager: RPCManager,
  configManager: ConfigManager,
  profileName: string,
): Promise<CallToolResult> {
  if (rpcManager.status !== 'connected') {
    return errorResult('Not connected to Discord. Call connect() first.');
  }

  if (!profileName) {
    return errorResult('Profile name is required');
  }

  try {
    const config = await configManager.load();
    const profile = config.profiles.find((p) => p.name === profileName);
    if (!profile) {
      const available = config.profiles.map((p) => p.name).join(', ');
      return errorResult(`Profile "${profileName}" not found. Available: ${available || '(none)'}`);
    }

    await rpcManager.setActivity(profile.activity, profile.name);
    return textResult(JSON.stringify({ success: true, profile: profile.name, activity: profile.activity }));
  } catch (err) {
    return errorResult(`Failed to set profile: ${(err as Error).message}`);
  }
}

export async function handleConnect(
  rpcManager: RPCManager,
  configManager: ConfigManager,
): Promise<CallToolResult> {
  if (rpcManager.status === 'connected') {
    return textResult('Already connected to Discord');
  }

  try {
    const config = await configManager.load();
    await rpcManager.connect(config.clientId);
    return textResult('Connected to Discord RPC');
  } catch (err) {
    return errorResult(`Connection failed: ${(err as Error).message}`);
  }
}

export async function handleDisconnect(rpcManager: RPCManager): Promise<CallToolResult> {
  try {
    await rpcManager.destroy();
    return textResult('Disconnected from Discord RPC');
  } catch (err) {
    return errorResult(`Disconnect failed: ${(err as Error).message}`);
  }
}

export async function handleOpenDevPortal(configManager: ConfigManager): Promise<CallToolResult> {
  try {
    const config = await configManager.load();
    const url = `https://discord.com/developers/applications/${config.clientId}/rich-presence/assets`;
    const msg = `Open this URL in your browser to upload Rich Presence images:\n${url}\n\n` +
      `After uploading:\n` +
      `1. Upload your images (PNG, JPEG, GIF)\n` +
      `2. Note the "Asset Name" Discord assigns (e.g., "myimage")\n` +
      `3. Use that name as largeImageKey or smallImageKey in set_activity\n` +
      `   Example: set_activity({ ..., largeImageKey: "myimage" })`;
    return textResult(msg);
  } catch (err) {
    return errorResult(`Failed to get client ID: ${(err as Error).message}`);
  }
}
