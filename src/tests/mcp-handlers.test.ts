import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import {
  handleSetActivity,
  handleListProfiles,
  handleGetStatus,
  handleSetProfile,
  handleConnect,
  handleDisconnect,
} from '../mcp/mcp-handlers.js';
import type { RPCManager } from '../core/rpc-manager.js';
import type { ConfigManager } from '../core/config-manager.js';
import type { DiscordDetector } from '../core/discord-detector.js';
import type { Config, ConnectionStatus } from '../types/index.js';

// ── Factories for mock objects ──

function createMockRPCManager(overrides: Partial<RPCManager> = {}): RPCManager {
  const emitter = new EventEmitter() as RPCManager;
  // Use Object.assign on a plain object to avoid constructor side-effects
  return Object.assign(emitter, {
    status: 'disconnected' as ConnectionStatus,
    connect: vi.fn(),
    setActivity: vi.fn(),
    destroy: vi.fn(),
    ...overrides,
  });
}

function createMockConfigManager(config: Config): ConfigManager {
  return {
    load: vi.fn().mockResolvedValue(config),
    save: vi.fn(),
    getConfigPath: vi.fn(),
    getSchema: vi.fn(),
  } as unknown as ConfigManager;
}

function createMockDiscordDetector(discordRunning = false): DiscordDetector {
  const emitter = new EventEmitter() as DiscordDetector;
  return Object.assign(emitter, {
    isDiscordRunning: vi.fn().mockReturnValue(discordRunning),
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
    destroy: vi.fn(),
  });
}

const SAMPLE_CONFIG: Config = {
  clientId: '123456789',
  transport: 'ipc',
  profiles: [
    { name: 'Coding', activity: { state: 'Building', details: 'MCP', name: 'app' } },
    { name: 'Idle', activity: { state: 'AFK', details: 'Away from keyboard' } },
  ],
  rotationInterval: 300,
};

// ── Tests ──

describe('handleSetActivity', () => {
  it('should return error when not connected', async () => {
    const rpc = createMockRPCManager({ status: 'disconnected' });
    const result = await handleSetActivity(rpc, { state: 'test' });
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('Not connected');
  });

  it('should call setActivity with parsed args when connected', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const result = await handleSetActivity(rpc, {
      state: 'Working',
      details: 'On a project',
      name: 'discord-rpc-tui',
      type: 0,
      startTimestamp: true,
    });

    expect(setActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'Working',
        details: 'On a project',
        name: 'discord-rpc-tui',
        type: 0,
        startTimestamp: true,
      }),
      'mcp',
    );
    expect(result.isError).toBeFalsy();
    expect((result.content[0] as any).text).toContain('successfully');
  });

  it('should handle optional fields like largeImageKey', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    await handleSetActivity(rpc, {
      state: 'test',
      largeImageKey: 'my-key',
      largeImageText: 'My tooltip',
      buttons: [
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Site', url: 'https://example.com' },
      ],
    });

    expect(setActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        largeImageKey: 'my-key',
        largeImageText: 'My tooltip',
        buttons: [
          { label: 'GitHub', url: 'https://github.com' },
          { label: 'Site', url: 'https://example.com' },
        ],
      }),
      'mcp',
    );
  });

  it('should cap buttons at 2', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    await handleSetActivity(rpc, {
      state: 'test',
      buttons: Array.from({ length: 5 }, (_, i) => ({ label: `B${i}`, url: `https://b${i}.com` })),
    });

    expect(setActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        buttons: expect.arrayContaining([
          expect.objectContaining({ label: 'B0' }),
          expect.objectContaining({ label: 'B1' }),
        ]),
      }),
      'mcp',
    );
    // Verify the actual call had exactly 2 buttons
    const callArgs = setActivity.mock.calls[0][0];
    expect(callArgs.buttons).toHaveLength(2);
  });

  it('should handle missing activity gracefully (empty args)', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const result = await handleSetActivity(rpc, {});
    expect(setActivity).toHaveBeenCalled();
    expect(result.isError).toBeFalsy();
    expect((result.content[0] as any).text).toContain('successfully');
  });

  it('should handle undefined args for all optional fields', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const result = await handleSetActivity(rpc, {
      state: undefined,
      details: undefined,
      name: undefined,
      type: 'not-a-number',
      startTimestamp: null,
      buttons: 'not-an-array',
    });
    expect(setActivity).toHaveBeenCalledWith(
      expect.objectContaining({}),
      'mcp',
    );
    expect(result.isError).toBeFalsy();
  });

  it('should return error when setActivity throws', async () => {
    const setActivity = vi.fn().mockRejectedValue(new Error('rate limited'));
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const result = await handleSetActivity(rpc, { state: 'test' });
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('rate limited');
  });

  it('should return error when setActivity rejects with unknown error', async () => {
    const setActivity = vi.fn().mockRejectedValue('unknown rejection');
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const result = await handleSetActivity(rpc, { state: 'testing' });
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('Failed to set activity');
  });
});

describe('handleListProfiles', () => {
  it('should return profiles from config', async () => {
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleListProfiles(configMgr);
    const data = JSON.parse((result.content[0] as any).text);
    expect(data.profiles).toHaveLength(2);
    expect(data.profiles[0].name).toBe('Coding');
  });

  it('should return error when config fails to load', async () => {
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    configMgr.load = vi.fn().mockRejectedValue(new Error('Config error'));
    const result = await handleListProfiles(configMgr);
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('Config error');
  });
});

describe('handleGetStatus', () => {
  it('should return status, discordOnline and profile info', async () => {
    const rpc = createMockRPCManager({ status: 'connected' });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const detector = createMockDiscordDetector(true);
    const result = await handleGetStatus(rpc, configMgr, detector);
    const data = JSON.parse((result.content[0] as any).text);
    expect(data.status).toBe('connected');
    expect(data.discordOnline).toBe(true);
    expect(data.currentProfile).toBe('Coding');
    expect(data.profileCount).toBe(2);
  });

  it('should handle config load failure gracefully', async () => {
    const rpc = createMockRPCManager({ status: 'disconnected' });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    configMgr.load = vi.fn().mockRejectedValue(new Error('fail'));
    const detector = createMockDiscordDetector(false);
    const result = await handleGetStatus(rpc, configMgr, detector);
    const data = JSON.parse((result.content[0] as any).text);
    expect(data.status).toBe('disconnected');
    expect(data.discordOnline).toBe(false);
    expect(data.currentProfile).toBeNull();
    expect(data.profileCount).toBe(0);
  });
});

describe('handleSetProfile', () => {
  it('should return error when not connected', async () => {
    const rpc = createMockRPCManager({ status: 'disconnected' });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleSetProfile(rpc, configMgr, 'Coding');
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('Not connected');
  });

  it('should return error when profile name is empty', async () => {
    const rpc = createMockRPCManager({ status: 'connected' });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleSetProfile(rpc, configMgr, '');
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('required');
  });

  it('should activate a named profile', async () => {
    const setActivity = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'connected', setActivity });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleSetProfile(rpc, configMgr, 'Coding');
    expect(setActivity).toHaveBeenCalledWith(SAMPLE_CONFIG.profiles[0].activity, 'Coding');
    expect(result.isError).toBeFalsy();
  });

  it('should return error for unknown profile', async () => {
    const rpc = createMockRPCManager({ status: 'connected' });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleSetProfile(rpc, configMgr, 'Unknown');
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('not found');
  });
});

describe('handleConnect', () => {
  it('should connect to Discord RPC', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ status: 'disconnected', connect });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleConnect(rpc, configMgr);
    expect(connect).toHaveBeenCalledWith('123456789');
    expect(result.isError).toBeFalsy();
    expect((result.content[0] as any).text).toContain('Connected');
  });

  it('should return already connected when status is connected', async () => {
    const connect = vi.fn();
    const rpc = createMockRPCManager({ status: 'connected', connect });
    const configMgr = createMockConfigManager(SAMPLE_CONFIG);
    const result = await handleConnect(rpc, configMgr);
    expect(connect).not.toHaveBeenCalled();
    expect((result.content[0] as any).text).toContain('Already connected');
  });
});

describe('handleDisconnect', () => {
  it('should disconnect', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    const rpc = createMockRPCManager({ destroy });
    const result = await handleDisconnect(rpc);
    expect(destroy).toHaveBeenCalledOnce();
    expect((result.content[0] as any).text).toContain('Disconnected');
  });

  it('should handle errors gracefully', async () => {
    const destroy = vi.fn().mockRejectedValue(new Error('destroy failed'));
    const rpc = createMockRPCManager({ destroy });
    const result = await handleDisconnect(rpc);
    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain('destroy failed');
  });
});
