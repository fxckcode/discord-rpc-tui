import { z } from 'zod';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import type { Config } from '../types/index.js';

const ActivityConfigSchema = z.object({
  name: z.string().optional(),
  state: z.string().optional(),
  details: z.string().optional(),
  startTimestamp: z.union([z.boolean(), z.number()]).optional(),
  endTimestamp: z.number().optional(),
  type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(5)]).optional(),
  largeImageKey: z.string().optional(),
  largeImageText: z.string().optional(),
  smallImageKey: z.string().optional(),
  smallImageText: z.string().optional(),
  buttons: z.array(z.object({ label: z.string(), url: z.string() })).max(2).optional(),
});

const ProfileSchema = z.object({
  name: z.string().min(1),
  activity: ActivityConfigSchema,
});

const ConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required. Create an app at https://discord.com/developers/applications'),
  transport: z.enum(['ipc', 'websocket']).default('ipc'),
  profiles: z.array(ProfileSchema).min(1, 'At least one profile is required'),
  rotationInterval: z.number().min(0).default(300),
});

const DEFAULT_CONFIG_PATH = join(homedir(), '.config', 'discord-rpc-tui', 'config.json');

const DEFAULT_CONFIG: Config = {
  clientId: '788494723714252871',
  transport: 'ipc',
  profiles: [
    {
      name: 'Coding',
      activity: {
        state: 'Building something cool',
        name: 'easy-rag',
        details: 'TypeScript • Ink TUI',
        startTimestamp: true,
        type: 0,
      },
    },
    {
      name: 'Idle',
      activity: {
        state: 'AFK',
        details: 'Away from keyboard',
        type: 0,
      },
    },
  ],
  rotationInterval: 600,
};

export class ConfigManager {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath ?? DEFAULT_CONFIG_PATH;
  }

  getConfigPath(): string {
    return this.configPath;
  }

  async load(): Promise<Config> {
    try {
      const data = await readFile(this.configPath, 'utf-8');
      const parsed = JSON.parse(data);
      return ConfigSchema.parse(parsed) as Config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.createDefault();
        return { ...DEFAULT_CONFIG };
      }
      throw new Error(`Invalid config: ${(error as Error).message}`);
    }
  }

  async save(config: Config): Promise<void> {
    const validated = ConfigSchema.parse(config) as Config;
    await mkdir(dirname(this.configPath), { recursive: true });
    await writeFile(this.configPath, JSON.stringify(validated, null, 2), 'utf-8');
  }

  private async createDefault(): Promise<void> {
    await this.save(DEFAULT_CONFIG);
  }

  getSchema(): typeof ConfigSchema {
    return ConfigSchema;
  }
}

export { ConfigSchema, ActivityConfigSchema, ProfileSchema, DEFAULT_CONFIG_PATH };
