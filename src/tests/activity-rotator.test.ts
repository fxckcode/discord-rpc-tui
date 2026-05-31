import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivityRotator } from '../core/activity-rotator.js';

describe('ActivityRotator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with index 0', () => {
    const rotator = new ActivityRotator(3);
    rotator.destroy(); // clean up, no side effects
  });

  it('should not rotate when only 1 profile', () => {
    const rotator = new ActivityRotator(1);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10);
    vi.advanceTimersByTime(30000); // 3 intervals

    expect(rotateSpy).not.toHaveBeenCalled();
    rotator.destroy();
  });

  it('should not rotate when intervalSeconds is 0', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(0);
    vi.advanceTimersByTime(60000);

    expect(rotateSpy).not.toHaveBeenCalled();
    rotator.destroy();
  });

  it('should not rotate when intervalSeconds is negative', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(-5);
    vi.advanceTimersByTime(60000);

    expect(rotateSpy).not.toHaveBeenCalled();
    rotator.destroy();
  });

  it('should emit rotate events at the specified interval', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10); // every 10 seconds

    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(rotateSpy).toHaveBeenCalledWith(1); // index 1 (0→1)

    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(2);
    expect(rotateSpy).toHaveBeenCalledWith(2); // index 2

    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(3);
    expect(rotateSpy).toHaveBeenCalledWith(0); // wraps around to 0

    rotator.destroy();
  });

  it('should wrap around to 0 after reaching profileCount - 1', () => {
    const rotator = new ActivityRotator(2);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(5);

    vi.advanceTimersByTime(5000);
    expect(rotateSpy).toHaveBeenCalledWith(1); // first rotation: 0→1

    vi.advanceTimersByTime(5000);
    expect(rotateSpy).toHaveBeenCalledWith(0); // wraps: 1→0

    rotator.destroy();
  });

  it('should stop rotation when stop() is called', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10);
    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    rotator.stop();
    vi.advanceTimersByTime(60000);
    expect(rotateSpy).toHaveBeenCalledTimes(1); // no more after stop

    rotator.destroy();
  });

  it('should be safe to call stop() multiple times', () => {
    const rotator = new ActivityRotator(3);
    rotator.start(10);
    rotator.stop();
    rotator.stop(); // second stop should not throw
    rotator.destroy();
  });

  it('should be safe to call start() multiple times (no duplicate intervals)', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10);
    rotator.start(10); // duplicate
    rotator.start(10); // duplicate

    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(1); // only one interval

    rotator.destroy();
  });

  it('should reset profile count and restart', () => {
    const rotator = new ActivityRotator(5);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10);
    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledWith(1);

    rotator.reset(2); // reduce to 2 profiles, stops rotation

    // Rotation is stopped after reset, need to call start again
    vi.advanceTimersByTime(60000);
    expect(rotateSpy).toHaveBeenCalledTimes(1); // no more since reset stops

    rotator.start(10);
    vi.advanceTimersByTime(10000);
    expect(rotateSpy).toHaveBeenCalledTimes(2);
    expect(rotateSpy).toHaveBeenCalledWith(1); // 0→1 in 2-profile system

    rotator.destroy();
  });

  it('should clean up all listeners on destroy', () => {
    const rotator = new ActivityRotator(3);
    const rotateSpy = vi.fn();
    rotator.on('rotate', rotateSpy);

    rotator.start(10);
    rotator.destroy(); // removes all listeners + stops interval

    vi.advanceTimersByTime(60000);
    expect(rotateSpy).not.toHaveBeenCalled();
  });
});
