import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiscordDetector } from '../core/discord-detector.js';

// Mock fs.accessSync using vi.fn() so it's a proper mock function
vi.mock('node:fs', () => ({
  accessSync: vi.fn(),
  constants: { R_OK: 4 },
}));

// Mock XDG_RUNTIME_DIR
const ORIGINAL_XDG = process.env.XDG_RUNTIME_DIR;

describe('DiscordDetector', () => {
  let detector: DiscordDetector;
  let accessSync: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.useFakeTimers();
    // Clear any XDG_RUNTIME_DIR for deterministic tests
    delete process.env.XDG_RUNTIME_DIR;
    detector = new DiscordDetector(1000); // 1s polling
    const fs = await import('node:fs');
    accessSync = fs.accessSync as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    detector.destroy();
    vi.useRealTimers();
    if (ORIGINAL_XDG) process.env.XDG_RUNTIME_DIR = ORIGINAL_XDG;
  });

  describe('isDiscordRunning', () => {
    it('should return true when socket is accessible', () => {
      accessSync.mockImplementation(() => undefined); // no throw = accessible
      expect(detector.isDiscordRunning()).toBe(true);
    });

    it('should return false when no socket is accessible', () => {
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); });
      expect(detector.isDiscordRunning()).toBe(false);
    });

    it('should try multiple socket paths', () => {
      accessSync
        .mockImplementationOnce(() => { throw new Error('ENOENT'); }) // first path fails
        .mockImplementationOnce(() => undefined); // second path succeeds

      expect(detector.isDiscordRunning()).toBe(true);
      expect(accessSync.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('should use XDG_RUNTIME_DIR when set', () => {
      process.env.XDG_RUNTIME_DIR = '/run/user/1000';
      const freshDetector = new DiscordDetector(1000);

      freshDetector.isDiscordRunning();
      expect(accessSync).toHaveBeenCalledWith(
        '/run/user/1000/discord-ipc-0',
        expect.anything(),
      );
      freshDetector.destroy();
    });
  });

  describe('startPolling / stopPolling', () => {
    it('should call isDiscordRunning immediately on startPolling (first check)', () => {
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); });

      const spy = vi.spyOn(detector, 'isDiscordRunning');
      detector.startPolling();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit discord-on when Discord becomes available', () => {
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); });

      const discordOnSpy = vi.fn();
      detector.on('discord-on', discordOnSpy);
      detector.startPolling();

      // Now Discord comes online
      accessSync.mockImplementation(() => undefined);
      vi.advanceTimersByTime(1000); // one poll cycle

      expect(discordOnSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit discord-off when Discord goes offline', () => {
      accessSync.mockImplementation(() => undefined);

      const discordOffSpy = vi.fn();
      detector.on('discord-off', discordOffSpy);
      detector.startPolling();

      // Discord goes offline
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); });
      vi.advanceTimersByTime(1000);

      expect(discordOffSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit if state has not changed', () => {
      accessSync.mockImplementation(() => undefined); // always online

      const discordOnSpy = vi.fn();
      const discordOffSpy = vi.fn();
      detector.on('discord-on', discordOnSpy);
      detector.on('discord-off', discordOffSpy);

      detector.startPolling();
      vi.advanceTimersByTime(5000); // 5 poll cycles, same state

      expect(discordOnSpy).not.toHaveBeenCalled();
      expect(discordOffSpy).not.toHaveBeenCalled();
    });

    it('should stop polling when stopPolling is called', () => {
      accessSync.mockImplementation(() => undefined);

      const spy = vi.spyOn(detector, 'isDiscordRunning');
      detector.startPolling();
      detector.stopPolling();

      spy.mockClear();
      vi.advanceTimersByTime(5000);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should be safe to call startPolling multiple times', () => {
      detector.startPolling();
      detector.startPolling(); // second call should no-op
      detector.stopPolling();
    });

    it('should detect offline → online → offline transitions', () => {
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); }); // offline

      const discordOnSpy = vi.fn();
      const discordOffSpy = vi.fn();
      detector.on('discord-on', discordOnSpy);
      detector.on('discord-off', discordOffSpy);

      detector.startPolling();

      // Goes online
      accessSync.mockImplementation(() => undefined);
      vi.advanceTimersByTime(2000);

      expect(discordOnSpy).toHaveBeenCalledTimes(1);
      expect(discordOffSpy).not.toHaveBeenCalled();

      // Goes offline again
      accessSync.mockImplementation(() => { throw new Error('ENOENT'); });
      vi.advanceTimersByTime(2000);

      expect(discordOffSpy).toHaveBeenCalledTimes(1);
      expect(discordOnSpy).toHaveBeenCalledTimes(1);
    });
  });
});
