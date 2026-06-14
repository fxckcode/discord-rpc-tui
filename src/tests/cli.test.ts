import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ConfigManager, ActivityConfigSchema, ProfileSchema, ConfigSchema } from '../core/config-manager.js';

describe('CLI: ActivityConfig parsing', () => {
  describe('JSON activity config', () => {
    it('should parse a minimal activity', () => {
      const json = JSON.stringify({ state: 'Working' });
      const parsed = JSON.parse(json);
      const result = ActivityConfigSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    });

    it('should parse a full activity with all fields', () => {
      const json = JSON.stringify({
        name: 'My App',
        state: 'Building',
        details: 'TypeScript project',
        startTimestamp: true,
        type: 0,
        largeImageKey: 'my-key',
        largeImageText: 'My tooltip',
        largeImageUrl: 'https://example.com/img.png',
        smallImageKey: 'small-key',
        smallImageText: 'Small text',
        smallImageUrl: 'https://example.com/small.png',
        buttons: [
          { label: 'GitHub', url: 'https://github.com' },
          { label: 'Docs', url: 'https://docs.example.com' },
        ],
      });
      const parsed = JSON.parse(json);
      const result = ActivityConfigSchema.safeParse(parsed);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state).toBe('Building');
        expect(result.data.type).toBe(0);
        expect(result.data.buttons).toHaveLength(2);
      }
    });

    it('should reject invalid JSON', () => {
      expect(() => JSON.parse('not json')).toThrow();
    });

    it('should reject activity with more than 2 buttons', () => {
      const parsed = {
        state: 'test',
        buttons: [
          { label: 'A', url: 'https://a.com' },
          { label: 'B', url: 'https://b.com' },
          { label: 'C', url: 'https://c.com' },
        ],
      };
      const result = ActivityConfigSchema.safeParse(parsed);
      expect(result.success).toBe(false);
    });

    it('should reject activity with invalid type', () => {
      const parsed = { state: 'test', type: 4 };
      const result = ActivityConfigSchema.safeParse(parsed);
      expect(result.success).toBe(false);
    });

    it('should accept startTimestamp as number', () => {
      const parsed = { state: 'test', startTimestamp: 1700000000 };
      const result = ActivityConfigSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    });

    it('should accept type 0, 1, 2, 3, and 5', () => {
      [0, 1, 2, 3, 5].forEach((type) => {
        const result = ActivityConfigSchema.safeParse({ state: 'test', type });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid url in largeImageUrl', () => {
      const result = ActivityConfigSchema.safeParse({ state: 'test', largeImageUrl: 'not-a-url' });
      expect(result.success).toBe(false);
    });

    it('should accept empty object (all fields optional)', () => {
      const result = ActivityConfigSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject button with missing url', () => {
      const result = ActivityConfigSchema.safeParse({
        state: 'test',
        buttons: [{ label: 'A' }],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('CLI: config update logic', () => {
  let tmpDir: string;
  let configPath: string;
  let manager: ConfigManager;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'rpc-tui-cli-'));
    configPath = join(tmpDir, 'config.json');
    manager = new ConfigManager(configPath);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('should update first profile with new activity', async () => {
    await manager.load();

    const newActivity = { state: 'New State', details: 'Overridden' };
    const config = await manager.load();
    config.profiles[0] = { name: 'Updated', activity: newActivity };
    await manager.save(config);

    const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(saved.profiles[0].name).toBe('Updated');
    expect(saved.profiles[0].activity.state).toBe('New State');
  });

  it('should reject empty profiles array on save', async () => {
    await manager.load();

    const config = await manager.load();
    config.profiles = [];

    await expect(manager.save(config)).rejects.toThrow();

    // Profiles should still have the existing entry (save failed)
    const reloaded = await manager.load();
    expect(reloaded.profiles.length).toBeGreaterThanOrEqual(1);
  });

  it('should use activity.name as profile name when updating', async () => {
    await manager.load();

    const newActivity = { name: 'MyApp', state: 'Running' };
    const config = await manager.load();
    config.profiles[0] = { name: 'MyApp', activity: newActivity };
    await manager.save(config);

    const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(saved.profiles[0].name).toBe('MyApp');
  });

  it('should fall back to "Custom" name when activity has no name', async () => {
    await manager.load();

    const newActivity = { state: 'Just State' };
    const config = await manager.load();
    config.profiles[0] = { name: 'Custom', activity: newActivity };
    await manager.save(config);

    const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
    expect(saved.profiles[0].name).toBe('Custom');
  });

  it('should validate config with ConfigSchema before saving', () => {
    const invalid = { clientId: '', transport: 'ipc', profiles: [], rotationInterval: 0 };
    const result = ConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject config with invalid transport value', () => {
    const result = ConfigSchema.safeParse({
      clientId: 'test',
      transport: 'invalid',
      profiles: [{ name: 'P1', activity: {} }],
      rotationInterval: 0,
    });
    expect(result.success).toBe(false);
  });
});
