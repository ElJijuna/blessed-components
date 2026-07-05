import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const pureAccordionModule = await import('../dist/accordion/index.js');
const blessedAccordionModule = await import('../dist/accordion/blessed.js');
const pureAlertModule = await import('../dist/alert/index.js');
const blessedAlertModule = await import('../dist/alert/blessed.js');
const pureBadgeModule = await import('../dist/badge/index.js');
const blessedBadgeModule = await import('../dist/badge/blessed.js');
const pureBreadcrumbModule = await import('../dist/breadcrumb/index.js');
const blessedBreadcrumbModule = await import('../dist/breadcrumb/blessed.js');
const pureBoxModule = await import('../dist/box/index.js');
const blessedBoxModule = await import('../dist/box/blessed.js');
const pureButtonModule = await import('../dist/button/index.js');
const blessedButtonModule = await import('../dist/button/blessed.js');
const pureCheckboxModule = await import('../dist/checkbox/index.js');
const blessedCheckboxModule = await import('../dist/checkbox/blessed.js');
const pureCodeModule = await import('../dist/code/index.js');
const blessedCodeModule = await import('../dist/code/blessed.js');
const pureCollapsibleModule = await import('../dist/collapsible/index.js');
const blessedCollapsibleModule = await import('../dist/collapsible/blessed.js');
const pureConfirmDialogModule = await import('../dist/confirm-dialog/index.js');
const blessedConfirmDialogModule = await import('../dist/confirm-dialog/blessed.js');
const pureConnectionStatusModule = await import('../dist/connection-status/index.js');
const blessedConnectionStatusModule = await import('../dist/connection-status/blessed.js');
const pureDescriptionListModule = await import('../dist/description-list/index.js');
const blessedDescriptionListModule = await import('../dist/description-list/blessed.js');
const pureCardModule = await import('../dist/card/index.js');
const blessedCardModule = await import('../dist/card/blessed.js');
const pureCenterModule = await import('../dist/center/index.js');
const blessedCenterModule = await import('../dist/center/blessed.js');
const pureClusterModule = await import('../dist/cluster/index.js');
const blessedClusterModule = await import('../dist/cluster/blessed.js');
const pureCalloutModule = await import('../dist/callout/index.js');
const blessedCalloutModule = await import('../dist/callout/blessed.js');
const pureDividerModule = await import('../dist/divider/index.js');
const blessedDividerModule = await import('../dist/divider/blessed.js');
const pureDialogModule = await import('../dist/dialog/index.js');
const blessedDialogModule = await import('../dist/dialog/blessed.js');
const pureEmptyStateModule = await import('../dist/empty-state/index.js');
const blessedEmptyStateModule = await import('../dist/empty-state/blessed.js');
const pureErrorStateModule = await import('../dist/error-state/index.js');
const blessedErrorStateModule = await import('../dist/error-state/blessed.js');
const pureFormModule = await import('../dist/form/index.js');
const blessedFormModule = await import('../dist/form/blessed.js');
const pureFormFieldModule = await import('../dist/form-field/index.js');
const blessedFormFieldModule = await import('../dist/form-field/blessed.js');
const pureTextFieldModule = await import('../dist/text-field/index.js');
const blessedTextFieldModule = await import('../dist/text-field/blessed.js');
const pureGaugeModule = await import('../dist/gauge/index.js');
const blessedGaugeModule = await import('../dist/gauge/blessed.js');
const pureGridModule = await import('../dist/grid/index.js');
const blessedGridModule = await import('../dist/grid/blessed.js');
const pureHeadingModule = await import('../dist/heading/index.js');
const blessedHeadingModule = await import('../dist/heading/blessed.js');
const pureHealthIndicatorModule = await import('../dist/health-indicator/index.js');
const blessedHealthIndicatorModule = await import('../dist/health-indicator/blessed.js');
const pureHelpOverlayModule = await import('../dist/help-overlay/index.js');
const blessedHelpOverlayModule = await import('../dist/help-overlay/blessed.js');
const pureKbdModule = await import('../dist/kbd/index.js');
const blessedKbdModule = await import('../dist/kbd/blessed.js');
const pureKeyValueModule = await import('../dist/key-value/index.js');
const blessedKeyValueModule = await import('../dist/key-value/blessed.js');
const pureLabelModule = await import('../dist/label/index.js');
const blessedLabelModule = await import('../dist/label/blessed.js');
const pureLegendModule = await import('../dist/legend/index.js');
const blessedLegendModule = await import('../dist/legend/blessed.js');
const pureMetricBarsModule = await import('../dist/metric-bars/index.js');
const blessedMetricBarsModule = await import('../dist/metric-bars/blessed.js');
const pureMultiSelectModule = await import('../dist/multi-select/index.js');
const blessedMultiSelectModule = await import('../dist/multi-select/blessed.js');
const pureListModule = await import('../dist/list/index.js');
const blessedListModule = await import('../dist/list/blessed.js');
const pureVirtualListModule = await import('../dist/virtual-list/index.js');
const blessedVirtualListModule = await import('../dist/virtual-list/blessed.js');
const pureLogViewerModule = await import('../dist/log-viewer/index.js');
const blessedLogViewerModule = await import('../dist/log-viewer/blessed.js');
const pureTimelineModule = await import('../dist/timeline/index.js');
const blessedTimelineModule = await import('../dist/timeline/blessed.js');
const pureMenuModule = await import('../dist/menu/index.js');
const blessedMenuModule = await import('../dist/menu/blessed.js');
const pureModule = await import('../dist/progress-bar/index.js');
const blessedModule = await import('../dist/progress-bar/blessed.js');
const pureMutedTextModule = await import('../dist/muted-text/index.js');
const blessedMutedTextModule = await import('../dist/muted-text/blessed.js');
const pureMultiSparklineModule = await import('../dist/multi-sparkline/index.js');
const blessedMultiSparklineModule = await import('../dist/multi-sparkline/blessed.js');
const pureOverlayModule = await import('../dist/overlay/index.js');
const blessedOverlayModule = await import('../dist/overlay/blessed.js');
const purePageModule = await import('../dist/page/index.js');
const blessedPageModule = await import('../dist/page/blessed.js');
const purePreformattedModule = await import('../dist/preformatted/index.js');
const blessedPreformattedModule = await import('../dist/preformatted/blessed.js');
const pureProgressListModule = await import('../dist/progress-list/index.js');
const blessedProgressListModule = await import('../dist/progress-list/blessed.js');
const pureProgressStackModule = await import('../dist/progress-stack/index.js');
const blessedProgressStackModule = await import('../dist/progress-stack/blessed.js');
const pureRadioGroupModule = await import('../dist/radio-group/index.js');
const blessedRadioGroupModule = await import('../dist/radio-group/blessed.js');
const pureSearchFieldModule = await import('../dist/search-field/index.js');
const blessedSearchFieldModule = await import('../dist/search-field/blessed.js');
const pureSelectModule = await import('../dist/select/index.js');
const blessedSelectModule = await import('../dist/select/blessed.js');
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
const pureSwitchModule = await import('../dist/switch/index.js');
const blessedSwitchModule = await import('../dist/switch/blessed.js');
const pureTaskProgressModule = await import('../dist/task-progress/index.js');
const blessedTaskProgressModule = await import('../dist/task-progress/blessed.js');
const pureTabListModule = await import('../dist/tab-list/index.js');
const blessedTabListModule = await import('../dist/tab-list/blessed.js');
const pureTabsModule = await import('../dist/tabs/index.js');
const blessedTabsModule = await import('../dist/tabs/blessed.js');
const pureTableModule = await import('../dist/table/index.js');
const blessedTableModule = await import('../dist/table/blessed.js');
const pureSpacerModule = await import('../dist/spacer/index.js');
const blessedSpacerModule = await import('../dist/spacer/blessed.js');
const pureStackModule = await import('../dist/stack/index.js');
const blessedStackModule = await import('../dist/stack/blessed.js');
const pureStatModule = await import('../dist/stat/index.js');
const blessedStatModule = await import('../dist/stat/blessed.js');
const pureTagModule = await import('../dist/tag/index.js');
const blessedTagModule = await import('../dist/tag/blessed.js');
const pureTextModule = await import('../dist/text/index.js');
const blessedTextModule = await import('../dist/text/blessed.js');
const pureTimestampModule = await import('../dist/timestamp/index.js');
const blessedTimestampModule = await import('../dist/timestamp/blessed.js');
const pureThresholdsModule = await import('../dist/thresholds/index.js');
const blessedThresholdsModule = await import('../dist/thresholds/blessed.js');
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
const [accordionEsmSource, accordionCjsSource] = await Promise.all(
  ['../dist/accordion/index.js', '../dist/accordion/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [badgeEsmSource, badgeCjsSource] = await Promise.all(
  ['../dist/badge/index.js', '../dist/badge/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [breadcrumbEsmSource, breadcrumbCjsSource] = await Promise.all(
  ['../dist/breadcrumb/index.js', '../dist/breadcrumb/index.cjs'].map((path) =>
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
const [checkboxEsmSource, checkboxCjsSource] = await Promise.all(
  ['../dist/checkbox/index.js', '../dist/checkbox/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [codeEsmSource, codeCjsSource] = await Promise.all(
  ['../dist/code/index.js', '../dist/code/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [collapsibleEsmSource, collapsibleCjsSource] = await Promise.all(
  ['../dist/collapsible/index.js', '../dist/collapsible/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [confirmDialogEsmSource, confirmDialogCjsSource] = await Promise.all(
  ['../dist/confirm-dialog/index.js', '../dist/confirm-dialog/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [connectionStatusEsmSource, connectionStatusCjsSource] = await Promise.all(
  ['../dist/connection-status/index.js', '../dist/connection-status/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [descriptionListEsmSource, descriptionListCjsSource] = await Promise.all(
  ['../dist/description-list/index.js', '../dist/description-list/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [cardEsmSource, cardCjsSource] = await Promise.all(
  ['../dist/card/index.js', '../dist/card/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [centerEsmSource, centerCjsSource] = await Promise.all(
  ['../dist/center/index.js', '../dist/center/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [clusterEsmSource, clusterCjsSource] = await Promise.all(
  ['../dist/cluster/index.js', '../dist/cluster/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [calloutEsmSource, calloutCjsSource] = await Promise.all(
  ['../dist/callout/index.js', '../dist/callout/index.cjs'].map((path) =>
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
const [formEsmSource, formCjsSource] = await Promise.all(
  ['../dist/form/index.js', '../dist/form/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [formFieldEsmSource, formFieldCjsSource] = await Promise.all(
  ['../dist/form-field/index.js', '../dist/form-field/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [textFieldEsmSource, textFieldCjsSource] = await Promise.all(
  ['../dist/text-field/index.js', '../dist/text-field/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [gaugeEsmSource, gaugeCjsSource] = await Promise.all(
  ['../dist/gauge/index.js', '../dist/gauge/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [gridEsmSource, gridCjsSource] = await Promise.all(
  ['../dist/grid/index.js', '../dist/grid/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [headingEsmSource, headingCjsSource] = await Promise.all(
  ['../dist/heading/index.js', '../dist/heading/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [healthIndicatorEsmSource, healthIndicatorCjsSource] = await Promise.all(
  ['../dist/health-indicator/index.js', '../dist/health-indicator/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [helpOverlayEsmSource, helpOverlayCjsSource] = await Promise.all(
  ['../dist/help-overlay/index.js', '../dist/help-overlay/index.cjs'].map((path) =>
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
const [legendEsmSource, legendCjsSource] = await Promise.all(
  ['../dist/legend/index.js', '../dist/legend/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [metricBarsEsmSource, metricBarsCjsSource] = await Promise.all(
  ['../dist/metric-bars/index.js', '../dist/metric-bars/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [multiSelectEsmSource, multiSelectCjsSource] = await Promise.all(
  ['../dist/multi-select/index.js', '../dist/multi-select/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [listEsmSource, listCjsSource] = await Promise.all(
  ['../dist/list/index.js', '../dist/list/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [virtualListEsmSource, virtualListCjsSource] = await Promise.all(
  ['../dist/virtual-list/index.js', '../dist/virtual-list/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [logViewerEsmSource, logViewerCjsSource] = await Promise.all(
  ['../dist/log-viewer/index.js', '../dist/log-viewer/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [timelineEsmSource, timelineCjsSource] = await Promise.all(
  ['../dist/timeline/index.js', '../dist/timeline/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [menuEsmSource, menuCjsSource] = await Promise.all(
  ['../dist/menu/index.js', '../dist/menu/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [mutedTextEsmSource, mutedTextCjsSource] = await Promise.all(
  ['../dist/muted-text/index.js', '../dist/muted-text/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [overlayEsmSource, overlayCjsSource] = await Promise.all(
  ['../dist/overlay/index.js', '../dist/overlay/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [pageEsmSource, pageCjsSource] = await Promise.all(
  ['../dist/page/index.js', '../dist/page/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [preformattedEsmSource, preformattedCjsSource] = await Promise.all(
  ['../dist/preformatted/index.js', '../dist/preformatted/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [multiSparklineEsmSource, multiSparklineCjsSource] = await Promise.all(
  ['../dist/multi-sparkline/index.js', '../dist/multi-sparkline/index.cjs'].map((path) =>
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
const [radioGroupEsmSource, radioGroupCjsSource] = await Promise.all(
  ['../dist/radio-group/index.js', '../dist/radio-group/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [searchFieldEsmSource, searchFieldCjsSource] = await Promise.all(
  ['../dist/search-field/index.js', '../dist/search-field/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [selectEsmSource, selectCjsSource] = await Promise.all(
  ['../dist/select/index.js', '../dist/select/index.cjs'].map((path) =>
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
const [switchEsmSource, switchCjsSource] = await Promise.all(
  ['../dist/switch/index.js', '../dist/switch/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [taskProgressEsmSource, taskProgressCjsSource] = await Promise.all(
  ['../dist/task-progress/index.js', '../dist/task-progress/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [tabListEsmSource, tabListCjsSource] = await Promise.all(
  ['../dist/tab-list/index.js', '../dist/tab-list/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [tabsEsmSource, tabsCjsSource] = await Promise.all(
  ['../dist/tabs/index.js', '../dist/tabs/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [tableEsmSource, tableCjsSource] = await Promise.all(
  ['../dist/table/index.js', '../dist/table/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [spacerEsmSource, spacerCjsSource] = await Promise.all(
  ['../dist/spacer/index.js', '../dist/spacer/index.cjs'].map((path) =>
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
const [tagEsmSource, tagCjsSource] = await Promise.all(
  ['../dist/tag/index.js', '../dist/tag/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [textEsmSource, textCjsSource] = await Promise.all(
  ['../dist/text/index.js', '../dist/text/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [timestampEsmSource, timestampCjsSource] = await Promise.all(
  ['../dist/timestamp/index.js', '../dist/timestamp/index.cjs'].map((path) =>
    readFile(new URL(path, import.meta.url), 'utf8'),
  ),
);
const [thresholdsEsmSource, thresholdsCjsSource] = await Promise.all(
  ['../dist/thresholds/index.js', '../dist/thresholds/index.cjs'].map((path) =>
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

assert.equal(typeof pureAccordionModule.calculateAccordionLayout, 'function');
assert.equal(typeof pureAccordionModule.toggleAccordionSection, 'function');
assert.equal(typeof blessedAccordionModule.accordion, 'function');
assert.equal(typeof pureAlertModule.renderAlert, 'function');
assert.equal(typeof blessedAlertModule.alert, 'function');
assert.equal(typeof pureBadgeModule.renderBadge, 'function');
assert.equal(typeof blessedBadgeModule.badge, 'function');
assert.equal(typeof pureBreadcrumbModule.renderBreadcrumb, 'function');
assert.equal(typeof blessedBreadcrumbModule.breadcrumb, 'function');
assert.equal(typeof pureBoxModule.resolveBoxTheme, 'function');
assert.equal(typeof blessedBoxModule.box, 'function');
assert.equal(typeof pureButtonModule.renderButton, 'function');
assert.equal(typeof blessedButtonModule.button, 'function');
assert.equal(typeof pureCheckboxModule.renderCheckbox, 'function');
assert.equal(typeof blessedCheckboxModule.checkbox, 'function');
assert.equal(typeof pureCodeModule.renderCode, 'function');
assert.equal(typeof blessedCodeModule.code, 'function');
assert.equal(typeof pureCollapsibleModule.renderCollapsibleHeader, 'function');
assert.equal(typeof pureCollapsibleModule.calculateCollapsibleLayout, 'function');
assert.equal(typeof blessedCollapsibleModule.collapsible, 'function');
assert.equal(typeof pureConfirmDialogModule.normalizeConfirmDialogAction, 'function');
assert.equal(typeof blessedConfirmDialogModule.confirmDialog, 'function');
assert.equal(typeof pureConnectionStatusModule.renderConnectionStatus, 'function');
assert.equal(typeof blessedConnectionStatusModule.connectionStatus, 'function');
assert.equal(typeof pureDescriptionListModule.renderDescriptionList, 'function');
assert.equal(typeof blessedDescriptionListModule.descriptionList, 'function');
assert.equal(typeof pureCardModule.renderCardRegion, 'function');
assert.equal(typeof blessedCardModule.cardRoot, 'function');
assert.equal(typeof blessedCardModule.cardHeader, 'function');
assert.equal(typeof blessedCardModule.cardTitle, 'function');
assert.equal(typeof blessedCardModule.cardDescription, 'function');
assert.equal(typeof blessedCardModule.cardBody, 'function');
assert.equal(typeof blessedCardModule.cardFooter, 'function');
assert.equal(typeof pureCenterModule.calculateCenterLayout, 'function');
assert.equal(typeof blessedCenterModule.center, 'function');
assert.equal(typeof pureClusterModule.calculateClusterLayout, 'function');
assert.equal(typeof blessedClusterModule.cluster, 'function');
assert.equal(typeof pureCalloutModule.renderCallout, 'function');
assert.equal(typeof blessedCalloutModule.callout, 'function');
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
assert.equal(typeof pureFormModule.createFormState, 'function');
assert.equal(typeof blessedFormModule.form, 'function');
assert.equal(typeof pureFormFieldModule.renderFormField, 'function');
assert.equal(typeof blessedFormFieldModule.formField, 'function');
assert.equal(typeof pureTextFieldModule.renderTextField, 'function');
assert.equal(typeof blessedTextFieldModule.textField, 'function');
assert.equal(typeof pureGaugeModule.renderGauge, 'function');
assert.equal(typeof blessedGaugeModule.gauge, 'function');
assert.equal(typeof pureGridModule.calculateGridLayout, 'function');
assert.equal(typeof blessedGridModule.grid, 'function');
assert.equal(typeof pureHeadingModule.renderHeading, 'function');
assert.equal(typeof blessedHeadingModule.heading, 'function');
assert.equal(typeof pureHealthIndicatorModule.renderHealthIndicator, 'function');
assert.equal(typeof blessedHealthIndicatorModule.healthIndicator, 'function');
assert.equal(typeof pureHelpOverlayModule.renderHelpOverlay, 'function');
assert.equal(typeof blessedHelpOverlayModule.helpOverlay, 'function');
assert.equal(typeof pureKbdModule.renderKbd, 'function');
assert.equal(typeof blessedKbdModule.kbd, 'function');
assert.equal(typeof pureKeyValueModule.renderKeyValue, 'function');
assert.equal(typeof blessedKeyValueModule.keyValue, 'function');
assert.equal(typeof pureLabelModule.renderLabel, 'function');
assert.equal(typeof blessedLabelModule.label, 'function');
assert.equal(typeof pureLegendModule.renderLegend, 'function');
assert.equal(typeof blessedLegendModule.legend, 'function');
assert.equal(typeof pureMetricBarsModule.renderMetricBars, 'function');
assert.equal(typeof blessedMetricBarsModule.metricBars, 'function');
assert.equal(typeof pureMultiSelectModule.renderMultiSelect, 'function');
assert.equal(typeof blessedMultiSelectModule.multiSelect, 'function');
assert.equal(typeof pureListModule.renderList, 'function');
assert.equal(typeof blessedListModule.list, 'function');
assert.equal(typeof pureVirtualListModule.computeVirtualListWindow, 'function');
assert.equal(typeof pureVirtualListModule.renderVirtualList, 'function');
assert.equal(typeof blessedVirtualListModule.virtualList, 'function');
assert.equal(typeof pureLogViewerModule.renderLogViewer, 'function');
assert.equal(typeof pureLogViewerModule.createLogViewerState, 'function');
assert.equal(typeof blessedLogViewerModule.logViewer, 'function');
assert.equal(typeof pureTimelineModule.renderTimeline, 'function');
assert.equal(typeof blessedTimelineModule.timeline, 'function');
assert.equal(typeof pureMenuModule.renderMenu, 'function');
assert.equal(typeof blessedMenuModule.menu, 'function');
assert.equal(typeof pureMutedTextModule.renderMutedText, 'function');
assert.equal(typeof blessedMutedTextModule.mutedText, 'function');
assert.equal(typeof pureMultiSparklineModule.renderMultiSparkline, 'function');
assert.equal(typeof blessedMultiSparklineModule.multiSparkline, 'function');
assert.equal(typeof pureOverlayModule.createOverlayState, 'function');
assert.equal(typeof blessedOverlayModule.overlay, 'function');
assert.equal(typeof purePageModule.calculatePageLayout, 'function');
assert.equal(typeof purePageModule.renderPageHeader, 'function');
assert.equal(typeof blessedPageModule.page, 'function');
assert.equal(typeof purePreformattedModule.renderPreformatted, 'function');
assert.equal(typeof blessedPreformattedModule.preformatted, 'function');
assert.equal(typeof pureModule.renderProgressBar, 'function');
assert.equal(typeof blessedModule.progressBar, 'function');
assert.equal(typeof pureProgressListModule.renderProgressList, 'function');
assert.equal(typeof blessedProgressListModule.progressList, 'function');
assert.equal(typeof pureProgressStackModule.renderProgressStack, 'function');
assert.equal(typeof blessedProgressStackModule.progressStack, 'function');
assert.equal(typeof pureRadioGroupModule.renderRadioGroup, 'function');
assert.equal(typeof blessedRadioGroupModule.radioGroup, 'function');
assert.equal(typeof pureSearchFieldModule.renderSearchField, 'function');
assert.equal(typeof blessedSearchFieldModule.searchField, 'function');
assert.equal(typeof pureSelectModule.renderSelect, 'function');
assert.equal(typeof blessedSelectModule.select, 'function');
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
assert.equal(typeof pureSwitchModule.renderSwitch, 'function');
assert.equal(typeof blessedSwitchModule.switchControl, 'function');
assert.equal(typeof pureTaskProgressModule.renderTaskProgress, 'function');
assert.equal(typeof blessedTaskProgressModule.taskProgress, 'function');
assert.equal(typeof pureTabListModule.renderTabList, 'function');
assert.equal(typeof blessedTabListModule.tabList, 'function');
assert.equal(typeof pureTabsModule.renderTabs, 'function');
assert.equal(typeof blessedTabsModule.tabs, 'function');
assert.equal(typeof pureTableModule.renderTable, 'function');
assert.equal(typeof blessedTableModule.table, 'function');
assert.equal(typeof pureSpacerModule.calculateSpacerLayout, 'function');
assert.equal(typeof blessedSpacerModule.spacer, 'function');
assert.equal(typeof pureStackModule.calculateStackLayout, 'function');
assert.equal(typeof blessedStackModule.stack, 'function');
assert.equal(typeof pureStatModule.renderStat, 'function');
assert.equal(typeof blessedStatModule.stat, 'function');
assert.equal(typeof pureTagModule.renderTag, 'function');
assert.equal(typeof blessedTagModule.tag, 'function');
assert.equal(typeof pureTextModule.renderText, 'function');
assert.equal(typeof blessedTextModule.text, 'function');
assert.equal(typeof pureTimestampModule.renderTimestamp, 'function');
assert.equal(typeof blessedTimestampModule.timestamp, 'function');
assert.equal(typeof pureThresholdsModule.renderThresholds, 'function');
assert.equal(typeof blessedThresholdsModule.thresholds, 'function');
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

for (const source of [accordionEsmSource, accordionCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Accordion entry must not import Blessed.');
}

for (const source of [alertEsmSource, alertCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Alert entry must not import Blessed.');
}

for (const source of [badgeEsmSource, badgeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Badge entry must not import Blessed.');
}

for (const source of [breadcrumbEsmSource, breadcrumbCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Breadcrumb entry must not import Blessed.');
}

for (const source of [boxEsmSource, boxCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Box entry must not import Blessed.');
}

for (const source of [buttonEsmSource, buttonCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Button entry must not import Blessed.');
}

for (const source of [checkboxEsmSource, checkboxCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Checkbox entry must not import Blessed.');
}

for (const source of [codeEsmSource, codeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Code entry must not import Blessed.');
}

for (const source of [collapsibleEsmSource, collapsibleCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure Collapsible entry must not import Blessed.',
  );
}

for (const source of [confirmDialogEsmSource, confirmDialogCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ConfirmDialog entry must not import Blessed.',
  );
}

for (const source of [cardEsmSource, cardCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Card entry must not import Blessed.');
}

for (const source of [centerEsmSource, centerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Center entry must not import Blessed.');
}

for (const source of [clusterEsmSource, clusterCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Cluster entry must not import Blessed.');
}

for (const source of [connectionStatusEsmSource, connectionStatusCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure ConnectionStatus entry must not import Blessed.',
  );
}

for (const source of [descriptionListEsmSource, descriptionListCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure DescriptionList entry must not import Blessed.',
  );
}

for (const source of [calloutEsmSource, calloutCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Callout entry must not import Blessed.');
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

for (const source of [formEsmSource, formCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Form entry must not import Blessed.');
}

for (const source of [formFieldEsmSource, formFieldCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure FormField entry must not import Blessed.');
}

for (const source of [textFieldEsmSource, textFieldCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure TextField entry must not import Blessed.');
}

for (const source of [gaugeEsmSource, gaugeCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Gauge entry must not import Blessed.');
}

for (const source of [gridEsmSource, gridCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Grid entry must not import Blessed.');
}

for (const source of [headingEsmSource, headingCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Heading entry must not import Blessed.');
}

for (const source of [helpOverlayEsmSource, helpOverlayCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure HelpOverlay entry must not import Blessed.',
  );
}

for (const source of [kbdEsmSource, kbdCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Kbd entry must not import Blessed.');
}

for (const source of [keyValueEsmSource, keyValueCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure KeyValue entry must not import Blessed.');
}

for (const source of [healthIndicatorEsmSource, healthIndicatorCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure HealthIndicator entry must not import Blessed.',
  );
}

for (const source of [labelEsmSource, labelCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Label entry must not import Blessed.');
}

for (const source of [legendEsmSource, legendCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Legend entry must not import Blessed.');
}

for (const source of [metricBarsEsmSource, metricBarsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MetricBars entry must not import Blessed.');
}

for (const source of [multiSelectEsmSource, multiSelectCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure MultiSelect entry must not import Blessed.',
  );
}

for (const source of [overlayEsmSource, overlayCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Overlay entry must not import Blessed.');
}

for (const source of [pageEsmSource, pageCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Page entry must not import Blessed.');
}

for (const source of [preformattedEsmSource, preformattedCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure Preformatted entry must not import Blessed.',
  );
}

for (const source of [listEsmSource, listCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure List entry must not import Blessed.');
}

for (const source of [virtualListEsmSource, virtualListCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure VirtualList entry must not import Blessed.',
  );
}

for (const source of [logViewerEsmSource, logViewerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure LogViewer entry must not import Blessed.');
}

for (const source of [timelineEsmSource, timelineCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Timeline entry must not import Blessed.');
}

for (const source of [menuEsmSource, menuCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Menu entry must not import Blessed.');
}

for (const source of [mutedTextEsmSource, mutedTextCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure MutedText entry must not import Blessed.');
}

for (const source of [multiSparklineEsmSource, multiSparklineCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure MultiSparkline entry must not import Blessed.',
  );
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

for (const source of [radioGroupEsmSource, radioGroupCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure RadioGroup entry must not import Blessed.');
}

for (const source of [searchFieldEsmSource, searchFieldCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure SearchField entry must not import Blessed.',
  );
}

for (const source of [selectEsmSource, selectCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Select entry must not import Blessed.');
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

for (const source of [switchEsmSource, switchCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Switch entry must not import Blessed.');
}

for (const source of [taskProgressEsmSource, taskProgressCjsSource]) {
  assert.equal(
    source.includes('blessed'),
    false,
    'Pure TaskProgress entry must not import Blessed.',
  );
}

for (const source of [tabListEsmSource, tabListCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure TabList entry must not import Blessed.');
}

for (const source of [tabsEsmSource, tabsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Tabs entry must not import Blessed.');
}

for (const source of [tableEsmSource, tableCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Table entry must not import Blessed.');
}

for (const source of [spacerEsmSource, spacerCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Spacer entry must not import Blessed.');
}

for (const source of [stackEsmSource, stackCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Stack entry must not import Blessed.');
}

for (const source of [statEsmSource, statCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Stat entry must not import Blessed.');
}

for (const source of [tagEsmSource, tagCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Tag entry must not import Blessed.');
}

for (const source of [textEsmSource, textCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Text entry must not import Blessed.');
}

for (const source of [timestampEsmSource, timestampCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Timestamp entry must not import Blessed.');
}

for (const source of [thresholdsEsmSource, thresholdsCjsSource]) {
  assert.equal(source.includes('blessed'), false, 'Pure Thresholds entry must not import Blessed.');
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
