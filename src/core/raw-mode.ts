import tty from 'node:tty';

export function isRawModeSupported(): boolean {
  return process.stdin.isTTY && tty.isatty(process.stdin.fd);
}
