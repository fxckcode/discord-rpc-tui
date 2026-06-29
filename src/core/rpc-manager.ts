import { EventEmitter } from 'node:events';
import { Client } from '@xhayper/discord-rpc';
import type { ActivityConfig, ConnectionStatus, RepoButtonConfig } from '../types/index.js';
import { injectRepoButton } from './activity-utils.js';

export declare interface RPCManager {
  on(event: 'connected', listener: () => void): this;
  on(event: 'disconnected', listener: () => void): this;
  on(event: 'activity-set', listener: (profileName: string) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'reconnecting', listener: (attempt: number) => void): this;
  on(event: 'status-change', listener: (status: ConnectionStatus) => void): this;
}

export class RPCManager extends EventEmitter {
  private client: Client | null = null;
  private clientId: string = '';
  private reconnectAttempt = 0;
  private maxReconnectDelay = 30000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private _status: ConnectionStatus = 'disconnected';
  private repoButtonConfig: RepoButtonConfig | null = null;

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    this.emit('status-change', status);
  }

  setRepoButtonConfig(config: RepoButtonConfig | null): void {
    this.repoButtonConfig = config;
  }

  async connect(clientId: string): Promise<void> {
    this.clientId = clientId;
    this.destroyed = false;
    this.setStatus('connecting');

    try {
      this.client = new Client({ clientId, transport: { type: 'ipc' } });

      this.client.on('ready', () => {
        this.reconnectAttempt = 0;
        this.setStatus('connected');
        this.emit('connected');
      });

      this.client.on('disconnected', () => {
        this.setStatus('disconnected');
        this.emit('disconnected');
        this.scheduleReconnect();
      });

      // Use login() instead of connect() — login() emits 'ready'
      // login() calls connect() internally, then emits 'ready' when no auth scopes are needed
      await this.client.login();
    } catch (error) {
      this.setStatus('disconnected');
      this.emit('error', error as Error);
      this.scheduleReconnect();
    }
  }

  async setActivity(activity: ActivityConfig, profileName?: string): Promise<void> {
    if (!this.client || this._status !== 'connected') {
      throw new Error('Not connected to Discord');
    }

    // Inject repo button if configured (respects Discord's 2-button max)
    const finalActivity = injectRepoButton(activity, this.repoButtonConfig);

    const rpcActivity: Record<string, unknown> = {};

    // name is the title shown on Discord (e.g., "Playing {name}")
    if (finalActivity.name) rpcActivity.name = finalActivity.name;
    if (finalActivity.state) rpcActivity.state = finalActivity.state;
    if (finalActivity.details) rpcActivity.details = finalActivity.details;
    if (finalActivity.type !== undefined) rpcActivity.type = finalActivity.type;

    // Handle timestamps
    if (finalActivity.startTimestamp === true) {
      rpcActivity.startTimestamp = Date.now();
    } else if (typeof finalActivity.startTimestamp === 'number') {
      rpcActivity.startTimestamp = finalActivity.startTimestamp;
    }
    if (finalActivity.endTimestamp) {
      rpcActivity.endTimestamp = finalActivity.endTimestamp;
    }

    // Assets
    // largeImageKey: uploaded asset name from Dev Portal (static images only)
    // largeImageUrl: external URL (static PNG/JPEG only — Discord CDN strips GIF animation)
    // Discord RPC uses mp:external/ prefix in large_image for external URLs
    // Both large_image (mp:external/URL) and large_url (raw URL) are required
    if (finalActivity.largeImageUrl) {
      rpcActivity.largeImageKey = `mp:external/${finalActivity.largeImageUrl}`;
      rpcActivity.largeImageUrl = finalActivity.largeImageUrl;
    } else if (finalActivity.largeImageKey) {
      rpcActivity.largeImageKey = finalActivity.largeImageKey;
    }
    if (finalActivity.largeImageText) rpcActivity.largeImageText = finalActivity.largeImageText;

    if (finalActivity.smallImageUrl) {
      rpcActivity.smallImageKey = `mp:external/${finalActivity.smallImageUrl}`;
      rpcActivity.smallImageUrl = finalActivity.smallImageUrl;
    } else if (finalActivity.smallImageKey) {
      rpcActivity.smallImageKey = finalActivity.smallImageKey;
    }
    if (finalActivity.smallImageText) rpcActivity.smallImageText = finalActivity.smallImageText;

    // Buttons (max 2)
    if (finalActivity.buttons && finalActivity.buttons.length > 0) {
      rpcActivity.buttons = finalActivity.buttons.slice(0, 2);
    }
    // instance must be false for non-game activities
    rpcActivity.instance = false;

    try {
      await this.client.user?.setActivity(rpcActivity);

      this.emit('activity-set', profileName ?? 'unknown');
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  private scheduleReconnect(): void {
    if (this.destroyed) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt),
      this.maxReconnectDelay,
    );

    this.reconnectAttempt++;
    this.setStatus('reconnecting');
    this.emit('reconnecting', this.reconnectAttempt);

    this.reconnectTimer = setTimeout(async () => {
      if (this.destroyed) return;
      try {
        await this.connect(this.clientId);
      } catch {
        this.scheduleReconnect();
      }
    }, delay);
  }

  async destroy(): Promise<void> {
    this.destroyed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      try {
        await this.client.destroy();
      } catch {
        // ignore destroy errors
      }
      this.client = null;
    }

    this.setStatus('disconnected');
    this.removeAllListeners();
  }
}
