import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  external: [/node_modules/],
  platform: 'node',
  target: 'node22',
});
