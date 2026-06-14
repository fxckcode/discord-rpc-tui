export type ActivityType = 0 | 1 | 2 | 3 | 5;

export interface ActivityConfig {
  name?: string;
  state?: string;
  details?: string;
  startTimestamp?: boolean | number;
  endTimestamp?: number;
  type: ActivityType;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  buttons?: { label: string; url: string }[];
}

export interface Presence {
  id: string;
  name: string;
  description: string;
  category: string;
  activity: ActivityConfig;
  tags: string[];
  clientId: string;
  featured?: boolean;
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening',
  3: 'Watching',
  5: 'Competing'
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  0: 'var(--timeline-grep)',
  1: 'var(--timeline-edit)',
  2: 'var(--timeline-read)',
  3: 'var(--timeline-thinking)',
  5: 'var(--timeline-done)'
};
