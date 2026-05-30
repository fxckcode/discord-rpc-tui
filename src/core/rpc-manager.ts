import { EventEmitter } from 'node:events';
import { Client } from '@xhayper/discord-rpc';
import type { ActivityConfig, ConnectionStatus } from '../types/index.js';

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

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    this.emit('status-change', status);
  }

  async connect(clientId: string): Promise<void> {
    this.clientId = clientId;
    this.destroyed = false;
    this.setStatus('connecting');

    try {
      this.client = new Client({ clientId, transport: 'ipc' });

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

    const rpcActivity: Record<string, unknown> = {};

    if (activity.state) rpcActivity.state = activity.state;
    if (activity.details) rpcActivity.details = activity.details;
    if (activity.type !== undefined) rpcActivity.type = activity.type;

    // Handle timestamps
    if (activity.startTimestamp === true) {
      rpcActivity.startTimestamp = Date.now();
    } else if (typeof activity.startTimestamp === 'number') {
      rpcActivity.startTimestamp = activity.startTimestamp;
    }
    if (activity.endTimestamp) {
      rpcActivity.endTimestamp = activity.endTimestamp;
    }

    // Assets
    if (activity.largeImageKey) rpcActivity.largeImageKey = activity.largeImageKey;
    if (activity.largeImageText) rpcActivity.largeImageText = activity.largeImageText;
    if (activity.smallImageKey) rpcActivity.smallImageKey = activity.smallImageKey;
    if (activity.smallImageText) rpcActivity.smallImageText = activity.smallImageText;

    // Buttons (max 2)
    if (activity.buttons && activity.buttons.length > 0) {
      rpcActivity.buttons = activity.buttons.slice(0, 2);
    }

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
