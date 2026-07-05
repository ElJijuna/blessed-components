import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const expectedComponents = [
  'src/components/layout/box/index.ts',
  'src/components/input/button/index.ts',
  'src/components/input/checkbox/index.ts',
  'src/components/input/form/index.ts',
  'src/components/input/form-field/index.ts',
  'src/components/input/multi-select/index.ts',
  'src/components/input/radio-group/index.ts',
  'src/components/input/search-field/index.ts',
  'src/components/input/select/index.ts',
  'src/components/input/switch/index.ts',
  'src/components/input/text-field/index.ts',
  'src/components/layout/card/index.ts',
  'src/components/layout/center/index.ts',
  'src/components/layout/cluster/index.ts',
  'src/components/feedback/callout/index.ts',
  'src/components/feedback/connection-status/index.ts',
  'src/components/layout/divider/index.ts',
  'src/components/layout/grid/index.ts',
  'src/components/layout/scroll-area/index.ts',
  'src/components/layout/spacer/index.ts',
  'src/components/layout/stack/index.ts',
  'src/components/layout/viewport/index.ts',
  'src/components/navigation/tabs/index.ts',
  'src/components/overlays/confirm-dialog/index.ts',
  'src/components/overlays/dialog/index.ts',
  'src/components/overlays/overlay/index.ts',
  'src/components/data-display/badge/index.ts',
  'src/components/data-display/breadcrumb/index.ts',
  'src/components/data-display/code/index.ts',
  'src/components/data-display/description-list/index.ts',
  'src/components/data-display/heading/index.ts',
  'src/components/navigation/help-overlay/index.ts',
  'src/components/data-display/kbd/index.ts',
  'src/components/data-display/key-value/index.ts',
  'src/components/data-display/label/index.ts',
  'src/components/data-display/muted-text/index.ts',
  'src/components/data-display/preformatted/index.ts',
  'src/components/collections/list/index.ts',
  'src/components/collections/log-viewer/index.ts',
  'src/components/collections/table/index.ts',
  'src/components/collections/timeline/index.ts',
  'src/components/collections/virtual-list/index.ts',
  'src/components/navigation/menu/index.ts',
  'src/components/data-display/stat/index.ts',
  'src/components/data-display/tag/index.ts',
  'src/components/data-display/text/index.ts',
  'src/components/data-display/timestamp/index.ts',
  'src/components/data-display/trend/index.ts',
  'src/components/feedback/alert/index.ts',
  'src/components/feedback/empty-state/index.ts',
  'src/components/feedback/error-state/index.ts',
  'src/components/feedback/health-indicator/index.ts',
  'src/components/feedback/progress-bar/index.ts',
  'src/components/feedback/progress-list/index.ts',
  'src/components/feedback/progress-stack/index.ts',
  'src/components/feedback/spinner/index.ts',
  'src/components/feedback/status/index.ts',
  'src/components/feedback/step-indicator/index.ts',
  'src/components/feedback/task-progress/index.ts',
  'src/components/navigation/tab-list/index.ts',
  'src/components/visualization/gauge/index.ts',
  'src/components/visualization/legend/index.ts',
  'src/components/visualization/metric-bars/index.ts',
  'src/components/visualization/multi-sparkline/index.ts',
  'src/components/visualization/sparkline/index.ts',
  'src/components/visualization/thresholds/index.ts',
];
const legacyComponents = [
  'src/components/data-display/list/index.ts',
  'src/components/badge/index.ts',
  'src/components/stat/index.ts',
  'src/components/progress-bar/index.ts',
  'src/components/metric-bars/index.ts',
  'src/components/sparkline/index.ts',
];

for (const path of expectedComponents) {
  await access(path);
}

for (const path of legacyComponents) {
  await assert.rejects(access(path), undefined, `Legacy component path still exists: ${path}`);
}

console.log('Component source architecture verified.');
