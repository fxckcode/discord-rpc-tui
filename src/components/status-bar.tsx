import React from 'react';
import { Box, Text } from 'ink';
import type { ConnectionStatus } from '../types/index.js';

interface StatusBarProps {
  status: ConnectionStatus;
  paused: boolean;
  discordOnline: boolean;
}

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: 'green',
  connecting: 'yellow',
  disconnected: 'red',
  'discord-offline': 'yellow',
  reconnecting: 'yellow',
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
  'discord-offline': 'Discord Offline',
  reconnecting: 'Reconnecting...',
};

export function StatusBar({ status, paused, discordOnline }: StatusBarProps) {
  const color = STATUS_COLORS[status] as 'green' | 'yellow' | 'red';
  const indicator = status === 'connected' ? '●' : '○';

  return (
    <Box flexDirection="row" gap={2}>
      <Box>
        <Text color={color}>
          {indicator} {STATUS_LABELS[status]}
        </Text>
      </Box>
      {!discordOnline && status !== 'discord-offline' && (
        <Box>
          <Text color="yellow">⚠ Discord not detected</Text>
        </Box>
      )}
      {paused && (
        <Box>
          <Text color="magenta">⏸ PAUSED</Text>
        </Box>
      )}
    </Box>
  );
}
