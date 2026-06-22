import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pureBadgeModule = await import('../dist/badge/index.js');
const blessedBadgeModule = await import('../dist/badge/blessed.js');
const pureBoxModule = await import('../dist/box/index.js');
const blessedBoxModule = await import('../dist/box/blessed.js');
const pureCardModule = await import('../dist/card/index.js');
const blessedCardModule = await import('../dist/card/blessed.js');
const pureDividerModule = await import('../dist/divider/index.js');
const blessedDividerModule = await import('../dist/divider/blessed.js');
const pureMetricBarsModule = await import('../dist/metric-bars/index.js');
const blessedMetricBarsModule = await import('../dist/metric-bars/blessed.js');
const pureListModule = await import('../dist/list/index.js');
const blessedListModule = await import('../dist/list/blessed.js');
const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const pureSparklineModule = await import('../dist/sparkline/index.js');
const blessedSparklineModule = await import('../dist/sparkline/blessed.js');
const pureSpinnerModule = await import('../dist/spinner/index.js');
const blessedSpinnerModule = await import('../dist/spinner/blessed.js');
const pureStackModule = await import('../dist/stack/index.js');
const blessedStackModule = await import('../dist/stack/blessed.js');
const pureStatModule = await import('../dist/stat/index.js');
const blessedStatModule = await import('../dist/stat/blessed.js');
const pureTextModule = await import('../dist/text/index.js');
const blessedTextModule = await import('../dist/text/blessed.js');
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
const [boxEsmSource, boxCjsSource] = await Promise.all(
  ['../dist/box/index.js', '../dist/box/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [cardEsmSource, cardCjsSource] = await Promise.all(
  ['../dist/card/index.js', '../dist/card/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [dividerEsmSource, dividerCjsSource] = await Promise.all(
  ['../dist/divider/index.js', '../dist/divider/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [metricBarsEsmSource, metricBarsCjsSource] = await Promise.all(
  ['../dist/metric-bars/index.js', '../dist/metric-bars/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [listEsmSource, listCjsSource] = await Promise.all(
  ['../dist/list/index.js', '../dist/list/index.cjs'].map((path) =>
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
const [spinnerEsmSource, spinnerCjsSource] = await Promise.all(
  ['../dist/spinner/index.js', '../dist/spinner/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [stackEsmSource, stackCjsSource] = await Promise.all(
  ['../dist/stack/index.js', '../dist/stack/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [statEsmSource, statCjsSource] = await Promise.all(
  ['../dist/stat/index.js', '../dist/stat/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [textEsmSource, textCjsSource] = await Promise.all(
  ['../dist/text/index.js', '../dist/text/index.cjs'].map((path) =>
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
assert.equal(typeof pureBoxModule.resolveBoxTheme, 'function');
assert.equal(typeof blessedBoxModule.box, 'function');
assert.equal(typeof pureCardModule.renderCardRegion, 'function');
assert.equal(typeof blessedCardModule.cardRoot, 'function');
assert.equal(typeof blessedCardModule.cardHeader, 'function');
assert.equal(typeof blessedCardModule.cardTitle, 'function');
assert.equal(typeof blessedCardModule.cardDescription, 'function');
assert.equal(typeof blessedCardModule.cardBody, 'function');
assert.equal(typeof blessedCardModule.cardFooter, 'function');
assert.equal(typeof pureDividerModule.renderDivider, 'function');
assert.equal(typeof blessedDividerModule.divider, 'function');
assert.equal(typeof pureMetricBarsModule.renderMetricBars, 'function');
assert.equal(typeof blessedMetricBarsModule.metricBars, 'function');
assert.equal(typeof pureListModule.renderList, 'function');
assert.equal(typeof blessedListModule.list, 'function');
assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');
assert.equal(typeof pureSparklineModule.renderSparkline, 'function');
assert.equal(typeof blessedSparklineModule.sparkline, 'function');
assert.equal(typeof pureSpinnerModule.renderSpinner, 'function');
assert.equal(typeof blessedSpinnerModule.spinner, 'function');
assert.equal(typeof pureStackModule.calculateStackLayout, 'function');
assert.equal(typeof blessedStackModule.stack, 'function');
assert.equal(typeof pureStatModule.renderStat, 'function');
assert.equal(typeof blessedStatModule.stat, 'function');
assert.equal(typeof pureTextModule.renderText, 'function');
assert.equal(typeof blessedTextModule.text, 'function');
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

for (const source of [boxEsmSource, boxCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Box entry must not import Blessed.');
}

for (const source of [cardEsmSource, cardCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Card entry must not import Blessed.');
}

for (const source of [dividerEsmSource, dividerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Divider entry must not import Blessed.');
}

for (const source of [metricBarsEsmSource, metricBarsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MetricBars entry must not import Blessed.');
}

for (const source of [listEsmSource, listCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure List entry must not import Blessed.');
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

for (const source of [spinnerEsmSource, spinnerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Spinner entry must not import Blessed.');
}

for (const source of [stackEsmSource, stackCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Stack entry must not import Blessed.');
}

for (const source of [statEsmSource, statCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Stat entry must not import Blessed.');
}

for (const source of [textEsmSource, textCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Text entry must not import Blessed.');
}

for (const source of [coreEsmSource, coreCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Core entry must not import Blessed.');
}

for (const source of [primitivesEsmSource, primitivesCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Primitives entry must not import Blessed.');
}

console.log('Package subpath exports verified.');
