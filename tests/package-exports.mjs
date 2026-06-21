import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pureBadgeModule = await import('../dist/badge/index.js');
const blessedBadgeModule = await import('../dist/badge/blessed.js');
const pureMetricBarsModule = await import('../dist/metric-bars/index.js');
const blessedMetricBarsModule = await import('../dist/metric-bars/blessed.js');
const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const pureSparklineModule = await import('../dist/sparkline/index.js');
const blessedSparklineModule = await import('../dist/sparkline/blessed.js');
const pureStatModule = await import('../dist/stat/index.js');
const blessedStatModule = await import('../dist/stat/blessed.js');
const coreModule = await import('../dist/core/index.js');
const scaleModule = await import('../dist/core/scale.js');
const primitivesModule = await import('../dist/primitives/index.js');
const selectionModule = await import('../dist/primitives/selection/index.js');
const rootTypes = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
const [badgeEsmSource, badgeCjsSource] = await Promise.all(
  ['../dist/badge/index.js', '../dist/badge/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [metricBarsEsmSource, metricBarsCjsSource] = await Promise.all(
  ['../dist/metric-bars/index.js', '../dist/metric-bars/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [pureEsmSource, pureCjsSource] = await Promise.all(
  ['../dist/progress-bar/index.js', '../dist/progress-bar/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [sparklineEsmSource, sparklineCjsSource] = await Promise.all(
  ['../dist/sparkline/index.js', '../dist/sparkline/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [statEsmSource, statCjsSource] = await Promise.all(
  ['../dist/stat/index.js', '../dist/stat/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [coreEsmSource, coreCjsSource] = await Promise.all(
  ['../dist/core/index.js', '../dist/core/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [primitivesEsmSource, primitivesCjsSource] = await Promise.all(
  ['../dist/primitives/index.js', '../dist/primitives/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);

assert.equal(typeof pureBadgeModule.renderBadge, 'function');
assert.equal(typeof blessedBadgeModule.badge, 'function');
assert.equal(typeof pureMetricBarsModule.renderMetricBars, 'function');
assert.equal(typeof blessedMetricBarsModule.metricBars, 'function');
assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');
assert.equal(typeof pureSparklineModule.renderSparkline, 'function');
assert.equal(typeof blessedSparklineModule.sparkline, 'function');
assert.equal(typeof pureStatModule.renderStat, 'function');
assert.equal(typeof blessedStatModule.stat, 'function');
assert.equal(typeof coreModule.visibleWidth, 'function');
assert.equal(typeof scaleModule.sampleSeries, 'function');
assert.equal(typeof primitivesModule.createViewport, 'function');
assert.equal(typeof selectionModule.createSelectionModel, 'function');
assert.equal(
  rootTypes.includes('BlessedComponentHandle'),
  true,
  'Root declarations must export the shared Blessed adapter handle.',
);

for (const source of [badgeEsmSource, badgeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Badge entry must not import Blessed.');
}

for (const source of [metricBarsEsmSource, metricBarsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MetricBars entry must not import Blessed.');
}

for (const source of [pureEsmSource, pureCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressBar entry must not import Blessed.',
  );
}

for (const source of [sparklineEsmSource, sparklineCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Sparkline entry must not import Blessed.');
}

for (const source of [statEsmSource, statCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Stat entry must not import Blessed.');
}

for (const source of [coreEsmSource, coreCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Core entry must not import Blessed.');
}

for (const source of [primitivesEsmSource, primitivesCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Primitives entry must not import Blessed.');
}

console.log('Package subpath exports verified.');
