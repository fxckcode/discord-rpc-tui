#!/usr/bin/env node
/**
 * Quick test: set_activity con imagen externa
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = resolve(__dirname, 'dist', 'index.js');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const proc = spawn('node', [SERVER_PATH, 'mcp'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const responses = [];
  const rl = createInterface({ input: proc.stdout });
  rl.on('line', (line) => {
    try { responses.push(JSON.parse(line)); } catch {}
  });

  let stderr = '';
  proc.stderr.on('data', (d) => { stderr += d.toString(); });

  await sleep(2000); // wait for server + auto-connect

  let id = 0;
  function send(method, params = {}) {
    id++;
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    return id;
  }

  async function waitResp(targetId, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const r = responses.find(x => x.id === targetId);
      if (r) return r;
      await sleep(100);
    }
    return null;
  }

  // Initialize
  send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'img-test', version: '1.0' },
  });
  await sleep(500);

  // Set activity with EXTERNAL IMAGE URL
  console.log('\n🔵 Enviando actividad CON imagen via URL externa...');
  send('tools/call', {
    name: 'set_activity',
    arguments: {
      state: '🔥 Imagen desde URL externa',
      details: 'Probando mp:external con Discord RPC',
      name: 'Image Test',
      type: 0,
      startTimestamp: true,
      largeImageUrl: 'https://cdn.discordapp.com/emojis/1100235054159048825.webp?size=96&quality=lossless',
      largeImageText: 'Logo de Discord desde URL',
    },
  });

  // Wait
  const r = await waitResp(id, 3000);
  if (r?.result) {
    const text = r.result.content?.[0]?.text || '';
    console.log(`✅ Resultado: ${text}`);
  } else if (r?.error) {
    console.log(`❌ Error: ${r.error.message}`);
  }

  // Now try with a different image (asset key approach)
  console.log('\n🔵 Enviando actividad con asset key (si existe)...');
  send('tools/call', {
    name: 'set_activity',
    arguments: {
      state: '🎮 Testing asset keys',
      details: 'Usando largeImageKey con nombre de asset',
      name: 'discord-rpc-tui',
      type: 0,
      startTimestamp: true,
      largeImageKey: 'discord_icon',
      largeImageText: 'Asset desde Dev Portal',
    },
  });

  const r2 = await waitResp(id, 3000);
  if (r2?.result) {
    const text = r2.result.content?.[0]?.text || '';
    console.log(`✅ Resultado: ${text}`);
  }

  // Show logs
  console.log('\n📋 Logs del servidor:');
  console.log(stderr);

  proc.stdin.end();
  setTimeout(() => proc.kill(), 500);
}

main().catch(console.error);
