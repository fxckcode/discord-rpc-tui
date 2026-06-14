import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  external: [
    'crypto',
  ],
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  platform: 'node',
  target: 'node22',
});
