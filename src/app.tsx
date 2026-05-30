import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { StatusBar } from './components/status-bar.js';
import type { ConfigManager } from './core/config-manager.js';
import type { RPCManager } from './core/rpc-manager.js';
import type { DiscordDetector } from './core/discord-detector.js';
import type { Config, ConnectionStatus, Profile } from './types/index.js';

interface AppProps {
  configManager: ConfigManager;
  rpcManager: RPCManager;
  discordDetector: DiscordDetector;
}

export function App({ configManager, rpcManager, discordDetector }: AppProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [currentProfile, setCurrentProfile] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [discordOnline, setDiscordOnline] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const setActivityForProfile = useCallback(async (profileIndex: number) => {
    if (!config) return;
    const profile = config.profiles[profileIndex];
    try {
      await rpcManager.setActivity(profile.activity, profile.name);
      addLog(`Activity set: ${profile.name}`);
    } catch (error) {
      addLog(`Error setting activity: ${(error as Error).message}`);
    }
  }, [config, rpcManager, addLog]);

  // Load config on mount
  useEffect(() => {
    configManager.load()
      .then((cfg) => {
        setConfig(cfg);
        addLog(`Config loaded: ${cfg.profiles.length} profiles`);
      })
      .catch((error) => {
        setConfigError(error.message);
        addLog(`Config error: ${error.message}`);
      });
  }, [configManager, addLog]);

  // Connect when config is ready
  useEffect(() => {
    if (!config || configError) return;
    addLog(`Connecting to Discord (clientId: ${config.clientId.slice(0, 8)}...)`);
    rpcManager.connect(config.clientId).catch((error) => {
      addLog(`Connection failed: ${error.message}`);
    });
  }, [config, configError, rpcManager, addLog]);

  // RPC events
  useEffect(() => {
    const onConnected = () => addLog('Connected to Discord');
    const onDisconnected = () => addLog('Disconnected from Discord');
    const onError = (error: Error) => addLog(`RPC Error: ${error.message}`);
    const onReconnecting = (attempt: number) => addLog(`Reconnecting (attempt ${attempt})...`);
    const onStatusChange = (s: ConnectionStatus) => setStatus(s);

    rpcManager.on('connected', onConnected);
    rpcManager.on('disconnected', onDisconnected);
    rpcManager.on('error', onError);
    rpcManager.on('reconnecting', onReconnecting);
    rpcManager.on('status-change', onStatusChange);

    return () => {
      rpcManager.removeListener('connected', onConnected);
      rpcManager.removeListener('disconnected', onDisconnected);
      rpcManager.removeListener('error', onError);
      rpcManager.removeListener('reconnecting', onReconnecting);
      rpcManager.removeListener('status-change', onStatusChange);
    };
  }, [rpcManager, addLog]);

  // Discord detection
  useEffect(() => {
    const onDiscordOn = () => {
      setDiscordOnline(true);
      addLog('Discord detected');
    };
    const onDiscordOff = () => {
      setDiscordOnline(false);
      addLog('Discord closed');
    };

    discordDetector.on('discord-on', onDiscordOn);
    discordDetector.on('discord-off', onDiscordOff);
    discordDetector.startPolling();

    // Initial check
    setDiscordOnline(discordDetector.isDiscordRunning());

    return () => {
      discordDetector.removeListener('discord-on', onDiscordOn);
      discordDetector.removeListener('discord-off', onDiscordOff);
      discordDetector.stopPolling();
    };
  }, [discordDetector, addLog]);

  // Set initial activity when connected
  useEffect(() => {
    if (status === 'connected' && config && !paused) {
      setActivityForProfile(currentProfile);
    }
  }, [status, config, currentProfile, paused, setActivityForProfile]);

  // Activity rotation
  useEffect(() => {
    if (!config || paused || status !== 'connected' || config.rotationInterval <= 0) return;

    const interval = setInterval(() => {
      setCurrentProfile((prev) => {
        const next = (prev + 1) % config.profiles.length;
        setActivityForProfile(next);
        return next;
      });
    }, config.rotationInterval * 1000);

    return () => clearInterval(interval);
  }, [config, paused, status, setActivityForProfile]);

  // Keybindings
  useInput((input) => {
    if (input === 'q') {
      process.exit(0);
    }
    if (input === ' ') {
      setPaused((p) => !p);
      addLog(paused ? 'Resumed' : 'Paused');
    }
    if (input === 'n' && config) {
      const next = (currentProfile + 1) % config.profiles.length;
      setCurrentProfile(next);
      setActivityForProfile(next);
    }
    if (input === 'r') {
      configManager.load()
        .then((cfg) => {
          setConfig(cfg);
          addLog('Config reloaded');
        })
        .catch((error) => addLog(`Reload failed: ${error.message}`));
    }
  });

  if (configError) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Configuration Error:</Text>
        <Text>{configError}</Text>
        <Text dimColor>Edit ~/.config/discord-rpc-tui/config.json and press 'r' to reload</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <StatusBar status={status} paused={paused} discordOnline={discordOnline} />

      <Box flexDirection="column">
        {config && config.profiles[currentProfile] && (
          <Box flexDirection="column">
            <Text bold>Current Activity:</Text>
            <Text>  Profile: {config.profiles[currentProfile].name}</Text>
            <Text>  State: {config.profiles[currentProfile].activity.state || '(none)'}</Text>
            <Text>  Details: {config.profiles[currentProfile].activity.details || '(none)'}</Text>
            {config.profiles[currentProfile].activity.buttons && (
              <Text>  Buttons: {config.profiles[currentProfile].activity.buttons!.length}</Text>
            )}
          </Box>
        )}
      </Box>

      <Box flexDirection="column">
        <Text bold>Profiles ({config?.profiles.length ?? 0}):</Text>
        {config?.profiles.map((p, i) => (
          <Text key={p.name} color={i === currentProfile ? 'cyan' : undefined}>
            {i === currentProfile ? '→ ' : '  '}{p.name}
          </Text>
        ))}
      </Box>

      <Box flexDirection="column">
        <Text bold>Events:</Text>
        <Box flexDirection="column" height={6} overflowY="auto">
          {logs.slice(-6).map((log, i) => (
            <Text key={i} dimColor>{log}</Text>
          ))}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          [{status === 'connected' ? '●' : '○'}] q:quit Space:pause n:next r:reload
        </Text>
      </Box>
    </Box>
  );
}
