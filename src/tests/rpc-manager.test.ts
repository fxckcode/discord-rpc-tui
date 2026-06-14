import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { RPCManager } from '../core/rpc-manager.js';

// Configuration store for the mock Client behavior
const mockConfig: {
  loginImpl: (() => Promise<void>) | null;
  setActivityImpl: ((activity: any) => Promise<void>) | null;
  destroyImpl: (() => Promise<void>) | null;
} = {
  loginImpl: null,
  setActivityImpl: null,
  destroyImpl: null,
};

let currentClient: MockClient | null = null;

class MockClient extends EventEmitter {
  user = {
    setActivity: vi.fn(async (activity: any) => {
      if (mockConfig.setActivityImpl) await mockConfig.setActivityImpl(activity);
    }),
  };
  login = vi.fn(async () => {
    if (mockConfig.loginImpl) await mockConfig.loginImpl();
  });
  destroy = vi.fn(async () => {
    if (mockConfig.destroyImpl) await mockConfig.destroyImpl();
  });
}

// Patch connect to use MockClient instead of real @xhayper/discord-rpc
RPCManager.prototype.connect = async function (clientId: string) {
  const self = this as any;
  self.clientId = clientId;
  self.destroyed = false;
  self.setStatus('connecting');

  currentClient = new MockClient();
  const client = currentClient;

  client.on('ready', () => {
    self.reconnectAttempt = 0;
    self.setStatus('connected');
    self.emit('connected');
  });

  client.on('disconnected', () => {
    self.setStatus('disconnected');
    self.emit('disconnected');
    self.scheduleReconnect();
  });

  self.client = client;

  try {
    await client.login();
  } catch (error) {
    self.setStatus('disconnected');
    self.emit('error', error as Error);
    self.scheduleReconnect();
  }
};

describe('RPCManager', () => {
  let manager: RPCManager;

  beforeEach(() => {
    // Reset config to defaults
    mockConfig.loginImpl = null; // null = resolves undefined
    mockConfig.setActivityImpl = null;
    mockConfig.destroyImpl = null;
    currentClient = null;
    vi.useFakeTimers();
    manager = new RPCManager();
  });

  afterEach(async () => {
    try { await manager.destroy(); } catch {}
    vi.useRealTimers();
  });

  async function connectAndEmitReady(clientId = 'test-client-id') {
    const p = manager.connect(clientId);
    const client = currentClient!;
    // Emit 'ready' on next tick to ensure the handler is registered
    client.emit('ready');
    await p;
    return client;
  }

  it('should start in disconnected state', () => {
    expect(manager.status).toBe('disconnected');
  });

  it('should emit connected and change status', async () => {
    const connectedSpy = vi.fn();
    manager.on('connected', connectedSpy);
    await connectAndEmitReady();
    expect(connectedSpy).toHaveBeenCalledTimes(1);
    expect(manager.status).toBe('connected');
  });

  it('should emit error on login failure', async () => {
    // Must set before connect
    const theErr = new Error('connection refused');
    mockConfig.loginImpl = vi.fn().mockRejectedValue(theErr);

    const errorSpy = vi.fn();
    manager.on('error', errorSpy);
    await manager.connect('test-client-id');

    expect(errorSpy).toHaveBeenCalledWith(theErr);
  });

  // Note: "should emit reconnecting on login failure" moved to
  // rpc-manager-reconnect.test.ts due to vitest caching issue

  it('should setActivity throw when not connected', async () => {
    await expect(manager.setActivity({ state: 'test' })).rejects.toThrow('Not connected to Discord');
  });

  it('should setActivity after connecting', async () => {
    const client = await connectAndEmitReady();
    await manager.setActivity({ state: 'Working', name: 'test-app' });
    expect(client.user.setActivity).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'Working', name: 'test-app' }),
    );
  });

  it('should emit error on setActivity failure', async () => {
    await connectAndEmitReady();
    const theErr = new Error('rate limited');
    mockConfig.setActivityImpl = vi.fn().mockRejectedValue(theErr);

    const errorSpy = vi.fn();
    manager.on('error', errorSpy);
    await expect(manager.setActivity({ state: 'fail' })).rejects.toThrow('rate limited');
    expect(errorSpy).toHaveBeenCalledWith(theErr);
  });

  it('should clean up client on destroy', async () => {
    await connectAndEmitReady();
    await manager.destroy();
    expect(currentClient?.destroy).toHaveBeenCalledTimes(1);
  });

  it('should be safe to call destroy multiple times', async () => {
    await manager.destroy();
    await manager.destroy();
  });

  it('should enforce max 2 buttons', async () => {
    await connectAndEmitReady();
    await manager.setActivity({
      state: 'test',
      buttons: [
        { label: 'A', url: 'https://a.com' },
        { label: 'B', url: 'https://b.com' },
        { label: 'C', url: 'https://c.com' },
      ],
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toHaveLength(2);
  });

  it('should emit activity-set after setting activity', async () => {
    await connectAndEmitReady();
    const activitySpy = vi.fn();
    manager.on('activity-set', activitySpy);
    await manager.setActivity({ state: 'Hello' }, 'TestProfile');
    expect(activitySpy).toHaveBeenCalledWith('TestProfile');
  });

  it('should convert largeImageUrl to mp:external format', async () => {
    await connectAndEmitReady();
    await manager.setActivity({
      state: 'test',
      largeImageUrl: 'https://example.com/image.png',
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.largeImageKey).toBe('mp:external/https://example.com/image.png');
  });

  it('should pass largeImageKey as-is for asset names', async () => {
    await connectAndEmitReady();
    await manager.setActivity({
      state: 'test',
      largeImageKey: 'my_uploaded_asset',
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.largeImageKey).toBe('my_uploaded_asset');
  });

  it('should prefer largeImageUrl over largeImageKey', async () => {
    await connectAndEmitReady();
    await manager.setActivity({
      state: 'test',
      largeImageKey: 'asset_name',
      largeImageUrl: 'https://example.com/image.png',
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.largeImageKey).toBe('mp:external/https://example.com/image.png');
  });

  it('should convert smallImageUrl to mp:external format', async () => {
    await connectAndEmitReady();
    await manager.setActivity({
      state: 'test',
      smallImageUrl: 'https://example.com/small.png',
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.smallImageKey).toBe('mp:external/https://example.com/small.png');
  });

  // ── Repo button auto-inject ──

  it('should inject repo button when no custom buttons', async () => {
    await connectAndEmitReady();
    manager.setRepoButtonConfig({
      showRepoButton: true,
      repoUrl: 'https://github.com/test/repo',
      repoButtonLabel: 'View Repo',
    });
    await manager.setActivity({ state: 'test' });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toHaveLength(1);
    expect(args.buttons[0]).toEqual({ label: 'View Repo', url: 'https://github.com/test/repo' });
  });

  it('should inject repo button as second slot when 1 custom button', async () => {
    await connectAndEmitReady();
    manager.setRepoButtonConfig({
      showRepoButton: true,
      repoUrl: 'https://github.com/test/repo',
      repoButtonLabel: 'View Repo',
    });
    await manager.setActivity({
      state: 'test',
      buttons: [{ label: 'Custom', url: 'https://example.com' }],
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toHaveLength(2);
    expect(args.buttons[0]).toEqual({ label: 'Custom', url: 'https://example.com' });
    expect(args.buttons[1]).toEqual({ label: 'View Repo', url: 'https://github.com/test/repo' });
  });

  it('should NOT inject repo button when already 2 custom buttons', async () => {
    await connectAndEmitReady();
    manager.setRepoButtonConfig({
      showRepoButton: true,
      repoUrl: 'https://github.com/test/repo',
      repoButtonLabel: 'View Repo',
    });
    await manager.setActivity({
      state: 'test',
      buttons: [
        { label: 'A', url: 'https://a.com' },
        { label: 'B', url: 'https://b.com' },
      ],
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toHaveLength(2);
    expect(args.buttons[0].url).toBe('https://a.com');
    expect(args.buttons[1].url).toBe('https://b.com');
  });

  it('should NOT inject repo button when showRepoButton is false', async () => {
    await connectAndEmitReady();
    manager.setRepoButtonConfig({
      showRepoButton: false,
      repoUrl: 'https://github.com/test/repo',
      repoButtonLabel: 'View Repo',
    });
    await manager.setActivity({ state: 'test' });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toBeUndefined();
  });

  it('should dedup repo button when URL already exists in custom buttons', async () => {
    await connectAndEmitReady();
    manager.setRepoButtonConfig({
      showRepoButton: true,
      repoUrl: 'https://github.com/test/repo',
      repoButtonLabel: 'View Repo',
    });
    await manager.setActivity({
      state: 'test',
      buttons: [{ label: 'Already Here', url: 'https://github.com/test/repo' }],
    });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toHaveLength(1);
    expect(args.buttons[0].label).toBe('Already Here');
  });

  it('should NOT inject repo button when repoButtonConfig is null', async () => {
    await connectAndEmitReady();
    // repoButtonConfig is null by default
    await manager.setActivity({ state: 'test' });
    const args = currentClient!.user.setActivity.mock.calls[0][0];
    expect(args.buttons).toBeUndefined();
  });
});
