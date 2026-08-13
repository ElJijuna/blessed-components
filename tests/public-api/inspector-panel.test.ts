import { describe, expect, it } from 'vitest';
import { renderInspectorPanel } from '@/index.js';

describe('InspectorPanel', () => {
  const tabs = [
    { content: '{ "ok": true }', id: 'json', label: 'JSON' },
    { content: '10:00 ready', id: 'logs', label: 'Logs' },
  ] as const;

  it('renders heading, metadata, active tab content, and actions', () => {
    expect(
      renderInspectorPanel({
        actions: [{ id: 'refresh', label: 'Refresh', shortcut: 'R' }],
        activeTabId: 'logs',
        metadata: [{ key: 'Status', value: 'healthy' }],
        subtitle: 'production',
        tabs,
        title: 'API',
        width: 60,
      }),
    ).toBe('# API - production\nStatus : healthy\n   JSON    [Logs]\n10:00 ready\nRefresh [R]');
  });
  it('falls back to the first enabled tab and clips output', () => {
    expect(renderInspectorPanel({ height: 2, tabs, title: 'API', width: 20 })).toBe(
      '# API\n  [JSON]    Logs ',
    );
  });
  it('sanitizes and validates input', () => {
    expect(renderInspectorPanel({ tabs: [], title: '{bold}API{/bold}', width: 20 })).toBe('# API');
    expect(() => renderInspectorPanel({ tabs, title: '', width: 20 })).toThrow(RangeError);
    expect(() => renderInspectorPanel({ tabs, title: 'API', width: -1 })).toThrow(RangeError);
  });
});
