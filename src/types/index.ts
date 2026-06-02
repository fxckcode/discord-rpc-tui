export type ActivityType = 0 | 1 | 2 | 3 | 5;

export interface ActivityConfig {
  name?: string;
  state?: string;
  details?: string;
  startTimestamp?: boolean | number;
  endTimestamp?: number;
  type?: ActivityType;
  largeImageKey?: string;
  largeImageText?: string;
  largeImageUrl?: string;
  smallImageKey?: string;
  smallImageText?: string;
  smallImageUrl?: string;
  buttons?: { label: string; url: string }[];
}

export interface Profile {
  name: string;
  activity: ActivityConfig;
}

export interface Config {
  clientId: string;
  transport: 'ipc' | 'websocket';
  profiles: Profile[];
  rotationInterval: number;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'discord-offline'
  | 'reconnecting';
