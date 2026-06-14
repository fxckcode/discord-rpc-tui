import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ConfigManager } from '../core/config-manager.js';

describe('ConfigManager', () => {
  let tmpDir: string;
  let configPath: string;
  let manager: ConfigManager;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'rpc-tui-test-'));
    configPath = join(tmpDir, 'config.json');
    manager = new ConfigManager(configPath);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should create default config on first load', async () => {
    const config = await manager.load();
    expect(config.clientId).toBe('788494723714252871');
    expect(config.profiles).toHaveLength(2);
    expect(config.transport).toBe('ipc');
    expect(config.rotationInterval).toBe(600);
    expect(existsSync(configPath)).toBe(true);
  });

  it('should load existing config', async () => {
    const testConfig = {
      clientId: '123456789',
      transport: 'ipc' as const,
      profiles: [{ name: 'Test', activity: { state: 'Testing' } }],
      rotationInterval: 300,
    };
    await writeFile(configPath, JSON.stringify(testConfig));
    const config = await manager.load();
    expect(config.clientId).toBe('123456789');
    expect(config.profiles).toHaveLength(1);
  });

  it('should validate config and throw on invalid', async () => {
    await writeFile(configPath, JSON.stringify({ clientId: '' }));
    await expect(manager.load()).rejects.toThrow('Client ID is required');
  });

  it('should save config', async () => {
    const config = {
      clientId: 'test-id',
      transport: 'ipc' as const,
      profiles: [{ name: 'P1', activity: { state: 'S1' } }],
      rotationInterval: 0,
    };
    await manager.save(config);
    const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(saved.clientId).toBe('test-id');
  });

  it('should reject config with more than 2 buttons', async () => {
    const config = {
      clientId: 'test',
      transport: 'ipc' as const,
      profiles: [{
        name: 'P1',
        activity: {
          state: 'S1',
          buttons: [
            { label: 'A', url: 'https://a.com' },
            { label: 'B', url: 'https://b.com' },
            { label: 'C', url: 'https://c.com' },
          ],
        },
      }],
      rotationInterval: 0,
    };
    await expect(manager.save(config)).rejects.toThrow();
  });

  describe('save()', () => {
    it('should validate clientId is non-empty', async () => {
      const config = {
        clientId: '',
        transport: 'ipc' as const,
        profiles: [{ name: 'P1', activity: { state: 'S1' } }],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).rejects.toThrow('Client ID is required');
    });

    it('should validate transport is ipc or websocket', async () => {
      const config = {
        clientId: 'test',
        transport: 'tcp' as any,
        profiles: [{ name: 'P1', activity: { state: 'S1' } }],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).rejects.toThrow();
    });

    it('should validate profiles is non-empty array', async () => {
      const config = {
        clientId: 'test',
        transport: 'ipc' as const,
        profiles: [],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).rejects.toThrow('At least one profile is required');
    });

    it('should validate rotationInterval is non-negative', async () => {
      const config = {
        clientId: 'test',
        transport: 'ipc' as const,
        profiles: [{ name: 'P1', activity: { state: 'S1' } }],
        rotationInterval: -1,
      };
      await expect(manager.save(config)).rejects.toThrow();
    });

    it('should validate profile name is non-empty', async () => {
      const config = {
        clientId: 'test',
        transport: 'ipc' as const,
        profiles: [{ name: '', activity: { state: 'S1' } }],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).rejects.toThrow();
    });

    it('should round-trip a full config: save then load', async () => {
      const config = {
        clientId: '123456',
        transport: 'websocket' as const,
        profiles: [
          { name: 'First', activity: { state: 'Working', details: 'Deep focus', type: 0 as const } },
          { name: 'Second', activity: { state: 'Chilling', type: 3 as const } },
        ],
        rotationInterval: 120,
        showRepoButton: false,
        repoUrl: 'https://example.com/repo',
        repoButtonLabel: 'Check it out',
      };
      await manager.save(config);
      const loaded = await manager.load();
      expect(loaded.clientId).toBe('123456');
      expect(loaded.transport).toBe('websocket');
      expect(loaded.profiles).toHaveLength(2);
      expect(loaded.profiles[0].activity.state).toBe('Working');
      expect(loaded.rotationInterval).toBe(120);
      expect(loaded.showRepoButton).toBe(false);
    });

    it('should accept url fields in activity (largeImageUrl, smallImageUrl)', async () => {
      const config = {
        clientId: 'test',
        transport: 'ipc' as const,
        profiles: [{
          name: 'P1',
          activity: {
            state: 'S1',
            largeImageUrl: 'https://example.com/img.png',
            smallImageUrl: 'https://example.com/small.png',
          },
        }],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).resolves.toBeUndefined();
    });

    it('should reject invalid url in largeImageUrl', async () => {
      const config = {
        clientId: 'test',
        transport: 'ipc' as const,
        profiles: [{
          name: 'P1',
          activity: { state: 'S1', largeImageUrl: 'not-a-url' },
        }],
        rotationInterval: 0,
      };
      await expect(manager.save(config)).rejects.toThrow();
    });
  });
});
