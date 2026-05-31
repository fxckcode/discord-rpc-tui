import { accessSync, constants } from 'node:fs';
import { EventEmitter } from 'node:events';

const STATIC_SOCKET_PATHS = [
  '/tmp/snap.discord/discord-ipc-0',
  '/tmp/app/com.discordapp.Discord/discord-ipc-0',
];

export declare interface DiscordDetector {
  on(event: 'discord-on', listener: () => void): this;
  on(event: 'discord-off', listener: () => void): this;
}

export class DiscordDetector extends EventEmitter {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private wasRunning = false;
  private pollIntervalMs: number;

  constructor(pollIntervalMs = 5000) {
    super();
    this.pollIntervalMs = pollIntervalMs;
  }

  private getSocketPaths(): string[] {
    const xdgPath = process.env.XDG_RUNTIME_DIR
      ? `${process.env.XDG_RUNTIME_DIR}/discord-ipc-0`
      : '/tmp/discord-ipc-0';
    return [xdgPath, ...STATIC_SOCKET_PATHS];
  }

  isDiscordRunning(): boolean {
    return this.getSocketPaths().some((socketPath) => {
      try {
        accessSync(socketPath, constants.R_OK);
        return true;
      } catch {
        return false;
      }
    });
  }

  startPolling(): void {
    if (this.intervalId) return;

    // Immediate first check
    this.wasRunning = this.isDiscordRunning();

    this.intervalId = setInterval(() => {
      const running = this.isDiscordRunning();
      if (running && !this.wasRunning) {
        this.wasRunning = true;
        this.emit('discord-on');
      } else if (!running && this.wasRunning) {
        this.wasRunning = false;
        this.emit('discord-off');
      }
    }, this.pollIntervalMs);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  destroy(): void {
    this.stopPolling();
    this.removeAllListeners();
  }
}
