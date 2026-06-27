import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const pureAlertModule = await import('../dist/alert/index.js');
const blessedAlertModule = await import('../dist/alert/blessed.js');
const pureBadgeModule = await import('../dist/badge/index.js');
const blessedBadgeModule = await import('../dist/badge/blessed.js');
const pureBoxModule = await import('../dist/box/index.js');
const blessedBoxModule = await import('../dist/box/blessed.js');
const pureButtonModule = await import('../dist/button/index.js');
const blessedButtonModule = await import('../dist/button/blessed.js');
const pureCardModule = await import('../dist/card/index.js');
const blessedCardModule = await import('../dist/card/blessed.js');
const pureDividerModule = await import('../dist/divider/index.js');
const blessedDividerModule = await import('../dist/divider/blessed.js');
const pureDialogModule = await import('../dist/dialog/index.js');
const blessedDialogModule = await import('../dist/dialog/blessed.js');
const pureEmptyStateModule = await import('../dist/empty-state/index.js');
const blessedEmptyStateModule = await import('../dist/empty-state/blessed.js');
const pureErrorStateModule = await import('../dist/error-state/index.js');
const blessedErrorStateModule = await import('../dist/error-state/blessed.js');
const pureGaugeModule = await import('../dist/gauge/index.js');
const blessedGaugeModule = await import('../dist/gauge/blessed.js');
const pureHeadingModule = await import('../dist/heading/index.js');
const blessedHeadingModule = await import('../dist/heading/blessed.js');
const pureKbdModule = await import('../dist/kbd/index.js');
const blessedKbdModule = await import('../dist/kbd/blessed.js');
const pureKeyValueModule = await import('../dist/key-value/index.js');
const blessedKeyValueModule = await import('../dist/key-value/blessed.js');
const pureLabelModule = await import('../dist/label/index.js');
const blessedLabelModule = await import('../dist/label/blessed.js');
const pureMetricBarsModule = await import('../dist/metric-bars/index.js');
const blessedMetricBarsModule = await import('../dist/metric-bars/blessed.js');
const pureListModule = await import('../dist/list/index.js');
const blessedListModule = await import('../dist/list/blessed.js');
const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const pureMutedTextModule = await import('../dist/muted-text/index.js');
const blessedMutedTextModule = await import('../dist/muted-text/blessed.js');
const pureProgressListModule = await import('../dist/progress-list/index.js');
const blessedProgressListModule = await import('../dist/progress-list/blessed.js');
const pureProgressStackModule = await import('../dist/progress-stack/index.js');
const blessedProgressStackModule = await import('../dist/progress-stack/blessed.js');
const pureScrollAreaModule = await import('../dist/scroll-area/index.js');
const blessedScrollAreaModule = await import('../dist/scroll-area/blessed.js');
const pureSparklineModule = await import('../dist/sparkline/index.js');
const blessedSparklineModule = await import('../dist/sparkline/blessed.js');
const pureSpinnerModule = await import('../dist/spinner/index.js');
const blessedSpinnerModule = await import('../dist/spinner/blessed.js');
const pureStatusModule = await import('../dist/status/index.js');
const blessedStatusModule = await import('../dist/status/blessed.js');
const pureStepIndicatorModule = await import('../dist/step-indicator/index.js');
const blessedStepIndicatorModule = await import('../dist/step-indicator/blessed.js');
const pureTaskProgressModule = await import('../dist/task-progress/index.js');
const blessedTaskProgressModule = await import('../dist/task-progress/blessed.js');
const pureTableModule = await import('../dist/table/index.js');
const blessedTableModule = await import('../dist/table/blessed.js');
const pureStackModule = await import('../dist/stack/index.js');
const blessedStackModule = await import('../dist/stack/blessed.js');
const pureStatModule = await import('../dist/stat/index.js');
const blessedStatModule = await import('../dist/stat/blessed.js');
const pureTextModule = await import('../dist/text/index.js');
const blessedTextModule = await import('../dist/text/blessed.js');
const pureTrendModule = await import('../dist/trend/index.js');
const blessedTrendModule = await import('../dist/trend/blessed.js');
const pureViewportModule = await import('../dist/viewport/index.js');
const blessedViewportModule = await import('../dist/viewport/blessed.js');
const coreModule = await import('../dist/core/index.js');
const scaleModule = await import('../dist/core/scale.js');
const primitivesModule = await import('../dist/primitives/index.js');
const selectionModule = await import('../dist/primitives/selection/index.js');
const distEntries = await readdir(new URL('../dist', import.meta.url), {
  recursive: true,
});
const publishedModulePaths = distEntries.filter((path) => /\.(?:cjs|cts|js|ts)$/.test(path));
const publishedModuleSources = await Promise.all(
  publishedModulePaths.map((path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8')),
);
const rootTypes = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
const [badgeEsmSource, badgeCjsSource] = await Promise.all(
  ['../dist/badge/index.js', '../dist/badge/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [alertEsmSource, alertCjsSource] = await Promise.all(
  ['../dist/alert/index.js', '../dist/alert/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [boxEsmSource, boxCjsSource] = await Promise.all(
  ['../dist/box/index.js', '../dist/box/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [buttonEsmSource, buttonCjsSource] = await Promise.all(
  ['../dist/button/index.js', '../dist/button/index.cjs'].map((path) =>
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
const [dialogEsmSource, dialogCjsSource] = await Promise.all(
  ['../dist/dialog/index.js', '../dist/dialog/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [emptyStateEsmSource, emptyStateCjsSource] = await Promise.all(
  ['../dist/empty-state/index.js', '../dist/empty-state/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [errorStateEsmSource, errorStateCjsSource] = await Promise.all(
  ['../dist/error-state/index.js', '../dist/error-state/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [gaugeEsmSource, gaugeCjsSource] = await Promise.all(
  ['../dist/gauge/index.js', '../dist/gauge/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [headingEsmSource, headingCjsSource] = await Promise.all(
  ['../dist/heading/index.js', '../dist/heading/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [kbdEsmSource, kbdCjsSource] = await Promise.all(
  ['../dist/kbd/index.js', '../dist/kbd/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [keyValueEsmSource, keyValueCjsSource] = await Promise.all(
  ['../dist/key-value/index.js', '../dist/key-value/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [labelEsmSource, labelCjsSource] = await Promise.all(
  ['../dist/label/index.js', '../dist/label/index.cjs'].map((path) =>
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
const [mutedTextEsmSource, mutedTextCjsSource] = await Promise.all(
  ['../dist/muted-text/index.js', '../dist/muted-text/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [pureEsmSource, pureCjsSource] = await Promise.all(
  ['../dist/progress-bar/index.js', '../dist/progress-bar/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [progressListEsmSource, progressListCjsSource] = await Promise.all(
  ['../dist/progress-list/index.js', '../dist/progress-list/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [progressStackEsmSource, progressStackCjsSource] = await Promise.all(
  ['../dist/progress-stack/index.js', '../dist/progress-stack/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [scrollAreaEsmSource, scrollAreaCjsSource] = await Promise.all(
  ['../dist/scroll-area/index.js', '../dist/scroll-area/index.cjs'].map((path) =>
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
const [statusEsmSource, statusCjsSource] = await Promise.all(
  ['../dist/status/index.js', '../dist/status/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [stepIndicatorEsmSource, stepIndicatorCjsSource] = await Promise.all(
  ['../dist/step-indicator/index.js', '../dist/step-indicator/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [taskProgressEsmSource, taskProgressCjsSource] = await Promise.all(
  ['../dist/task-progress/index.js', '../dist/task-progress/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [tableEsmSource, tableCjsSource] = await Promise.all(
  ['../dist/table/index.js', '../dist/table/index.cjs'].map((path) =>
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
const [trendEsmSource, trendCjsSource] = await Promise.all(
  ['../dist/trend/index.js', '../dist/trend/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [viewportEsmSource, viewportCjsSource] = await Promise.all(
  ['../dist/viewport/index.js', '../dist/viewport/index.cjs'].map((path) =>
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

assert.equal(typeof pureAlertModule.renderAlert, 'function');
assert.equal(typeof blessedAlertModule.alert, 'function');
assert.equal(typeof pureBadgeModule.renderBadge, 'function');
assert.equal(typeof blessedBadgeModule.badge, 'function');
assert.equal(typeof pureBoxModule.resolveBoxTheme, 'function');
assert.equal(typeof blessedBoxModule.box, 'function');
assert.equal(typeof pureButtonModule.renderButton, 'function');
assert.equal(typeof blessedButtonModule.button, 'function');
assert.equal(typeof pureCardModule.renderCardRegion, 'function');
assert.equal(typeof blessedCardModule.cardRoot, 'function');
assert.equal(typeof blessedCardModule.cardHeader, 'function');
assert.equal(typeof blessedCardModule.cardTitle, 'function');
assert.equal(typeof blessedCardModule.cardDescription, 'function');
assert.equal(typeof blessedCardModule.cardBody, 'function');
assert.equal(typeof blessedCardModule.cardFooter, 'function');
assert.equal(typeof pureDividerModule.renderDivider, 'function');
assert.equal(typeof blessedDividerModule.divider, 'function');
assert.equal(typeof pureDialogModule.createDialogState, 'function');
assert.equal(typeof blessedDialogModule.dialogRoot, 'function');
assert.equal(typeof blessedDialogModule.dialogContent, 'function');
assert.equal(typeof blessedDialogModule.dialogTitle, 'function');
assert.equal(typeof blessedDialogModule.dialogDescription, 'function');
assert.equal(typeof blessedDialogModule.dialogBody, 'function');
assert.equal(typeof blessedDialogModule.dialogFooter, 'function');
assert.equal(typeof pureEmptyStateModule.renderEmptyState, 'function');
assert.equal(typeof blessedEmptyStateModule.emptyState, 'function');
assert.equal(typeof pureErrorStateModule.renderErrorState, 'function');
assert.equal(typeof blessedErrorStateModule.errorState, 'function');
assert.equal(typeof pureGaugeModule.renderGauge, 'function');
assert.equal(typeof blessedGaugeModule.gauge, 'function');
assert.equal(typeof pureHeadingModule.renderHeading, 'function');
assert.equal(typeof blessedHeadingModule.heading, 'function');
assert.equal(typeof pureKbdModule.renderKbd, 'function');
assert.equal(typeof blessedKbdModule.kbd, 'function');
assert.equal(typeof pureKeyValueModule.renderKeyValue, 'function');
assert.equal(typeof blessedKeyValueModule.keyValue, 'function');
assert.equal(typeof pureLabelModule.renderLabel, 'function');
assert.equal(typeof blessedLabelModule.label, 'function');
assert.equal(typeof pureMetricBarsModule.renderMetricBars, 'function');
assert.equal(typeof blessedMetricBarsModule.metricBars, 'function');
assert.equal(typeof pureListModule.renderList, 'function');
assert.equal(typeof blessedListModule.list, 'function');
assert.equal(typeof pureMutedTextModule.renderMutedText, 'function');
assert.equal(typeof blessedMutedTextModule.mutedText, 'function');
assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');
assert.equal(typeof pureProgressListModule.renderProgressList, 'function');
assert.equal(typeof blessedProgressListModule.progressList, 'function');
assert.equal(typeof pureProgressStackModule.renderProgressStack, 'function');
assert.equal(typeof blessedProgressStackModule.progressStack, 'function');
assert.equal(typeof pureScrollAreaModule.renderScrollAreaScrollbar, 'function');
assert.equal(typeof blessedScrollAreaModule.scrollArea, 'function');
assert.equal(typeof pureSparklineModule.renderSparkline, 'function');
assert.equal(typeof blessedSparklineModule.sparkline, 'function');
assert.equal(typeof pureSpinnerModule.renderSpinner, 'function');
assert.equal(typeof blessedSpinnerModule.spinner, 'function');
assert.equal(typeof pureStatusModule.renderStatus, 'function');
assert.equal(typeof blessedStatusModule.status, 'function');
assert.equal(typeof pureStepIndicatorModule.renderStepIndicator, 'function');
assert.equal(typeof blessedStepIndicatorModule.stepIndicator, 'function');
assert.equal(typeof pureTaskProgressModule.renderTaskProgress, 'function');
assert.equal(typeof blessedTaskProgressModule.taskProgress, 'function');
assert.equal(typeof pureTableModule.renderTable, 'function');
assert.equal(typeof blessedTableModule.table, 'function');
assert.equal(typeof pureStackModule.calculateStackLayout, 'function');
assert.equal(typeof blessedStackModule.stack, 'function');
assert.equal(typeof pureStatModule.renderStat, 'function');
assert.equal(typeof blessedStatModule.stat, 'function');
assert.equal(typeof pureTextModule.renderText, 'function');
assert.equal(typeof blessedTextModule.text, 'function');
assert.equal(typeof pureTrendModule.renderTrend, 'function');
assert.equal(typeof blessedTrendModule.trend, 'function');
assert.equal(typeof pureViewportModule.calculateViewportLayout, 'function');
assert.equal(typeof blessedViewportModule.viewport, 'function');
assert.equal(typeof coreModule.visibleWidth, 'function');
assert.equal(typeof scaleModule.sampleSeries, 'function');
assert.equal(typeof primitivesModule.createViewport, 'function');
assert.equal(typeof selectionModule.createSelectionModel, 'function');
assert.equal(
  rootTypes.includes('BlessedComponentHandle'),
  true,
  'Root declarations must export the shared Blessed adapter handle.',
);
assert.equal(
  publishedModuleSources.some((source) => source.includes('@/')),
  false,
  'Published modules and declarations must not contain internal @ aliases.',
);

for (const source of [alertEsmSource, alertCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Alert entry must not import Blessed.');
}

for (const source of [badgeEsmSource, badgeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Badge entry must not import Blessed.');
}

for (const source of [boxEsmSource, boxCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Box entry must not import Blessed.');
}

for (const source of [buttonEsmSource, buttonCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Button entry must not import Blessed.');
}

for (const source of [cardEsmSource, cardCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Card entry must not import Blessed.');
}

for (const source of [dividerEsmSource, dividerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Divider entry must not import Blessed.');
}

for (const source of [dialogEsmSource, dialogCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Dialog entry must not import Blessed.');
}

for (const source of [emptyStateEsmSource, emptyStateCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure EmptyState entry must not import Blessed.');
}

for (const source of [errorStateEsmSource, errorStateCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure ErrorState entry must not import Blessed.');
}

for (const source of [gaugeEsmSource, gaugeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Gauge entry must not import Blessed.');
}

for (const source of [headingEsmSource, headingCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Heading entry must not import Blessed.');
}

for (const source of [kbdEsmSource, kbdCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Kbd entry must not import Blessed.');
}

for (const source of [keyValueEsmSource, keyValueCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure KeyValue entry must not import Blessed.');
}

for (const source of [labelEsmSource, labelCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Label entry must not import Blessed.');
}

for (const source of [metricBarsEsmSource, metricBarsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MetricBars entry must not import Blessed.');
}

for (const source of [listEsmSource, listCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure List entry must not import Blessed.');
}

for (const source of [mutedTextEsmSource, mutedTextCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MutedText entry must not import Blessed.');
}

for (const source of [pureEsmSource, pureCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressBar entry must not import Blessed.',
  );
}

for (const source of [progressListEsmSource, progressListCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressList entry must not import Blessed.',
  );
}

for (const source of [progressStackEsmSource, progressStackCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ProgressStack entry must not import Blessed.',
  );
}

for (const source of [scrollAreaEsmSource, scrollAreaCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure ScrollArea entry must not import Blessed.');
}

for (const source of [sparklineEsmSource, sparklineCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Sparkline entry must not import Blessed.');
}

for (const source of [spinnerEsmSource, spinnerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Spinner entry must not import Blessed.');
}

for (const source of [statusEsmSource, statusCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Status entry must not import Blessed.');
}

for (const source of [stepIndicatorEsmSource, stepIndicatorCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure StepIndicator entry must not import Blessed.',
  );
}

for (const source of [taskProgressEsmSource, taskProgressCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure TaskProgress entry must not import Blessed.',
  );
}

for (const source of [tableEsmSource, tableCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Table entry must not import Blessed.');
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

for (const source of [trendEsmSource, trendCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Trend entry must not import Blessed.');
}

for (const source of [viewportEsmSource, viewportCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Viewport entry must not import Blessed.');
}

for (const source of [coreEsmSource, coreCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Core entry must not import Blessed.');
}

for (const source of [primitivesEsmSource, primitivesCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Primitives entry must not import Blessed.');
}

console.log('Package subpath exports verified.');
