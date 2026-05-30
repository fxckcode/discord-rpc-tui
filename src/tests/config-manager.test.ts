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
    expect(config.clientId).toBe('YOUR_CLIENT_ID_HERE');
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
});
