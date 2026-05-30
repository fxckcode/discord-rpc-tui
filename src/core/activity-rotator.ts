import { EventEmitter } from 'node:events';

export declare interface ActivityRotator {
  on(event: 'rotate', listener: (profileIndex: number) => void): this;
}

export class ActivityRotator extends EventEmitter {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentIndex = 0;
  private profileCount: number;

  constructor(profileCount: number) {
    super();
    this.profileCount = profileCount;
  }

  start(intervalSeconds: number): void {
    if (this.intervalId) return;
    if (intervalSeconds <= 0 || this.profileCount <= 1) return;

    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.profileCount;
      this.emit('rotate', this.currentIndex);
    }, intervalSeconds * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(profileCount: number): void {
    this.stop();
    this.profileCount = profileCount;
    this.currentIndex = 0;
  }

  destroy(): void {
    this.stop();
    this.removeAllListeners();
  }
}
