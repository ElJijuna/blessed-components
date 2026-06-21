import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    'progress-bar/blessed': 'src/adapters/blessed/progress-bar.ts',
    'progress-bar/index': 'src/components/progress-bar/index.ts',
    'sparkline/blessed': 'src/adapters/blessed/sparkline.ts',
    'sparkline/index': 'src/components/sparkline/index.ts',
    'stat/blessed': 'src/adapters/blessed/stat.ts',
    'stat/index': 'src/components/stat/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  platform: 'node',
  sourcemap: true,
  splitting: false,
  target: 'node22',
  treeshake: true,
});
