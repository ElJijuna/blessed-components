import { renderPlainLines } from '@/components/shared/text.js';

/** Test status rendered by {@link renderTestResults}. */
export type TestResultStatus = 'failed' | 'passed' | 'skipped';

/** Test case row. */
export interface TestResultCase {
  /** Duration in milliseconds. */
  durationMs?: number;

  /** Failure message. */
  message?: string;

  /** Test name. */
  name: string;

  /** Suite name. */
  suite?: string;

  /** Test status. */
  status: TestResultStatus;
}

/** Options accepted by {@link renderTestResults}. */
export interface RenderTestResultsOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Test cases. */
  tests: readonly TestResultCase[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

const STATUS: Record<TestResultStatus, string> = {
  failed: 'FAIL',
  passed: 'PASS',
  skipped: 'SKIP',
};

/** Renders suite/test outcomes with summary counts. */
export function renderTestResults({ height, tests, width }: RenderTestResultsOptions): string {
  const counts: Record<TestResultStatus, number> = { failed: 0, passed: 0, skipped: 0 };

  for (const test of tests) {
    counts[test.status] += 1;
  }

  const lines = [
    `passed ${counts.passed} failed ${counts.failed} skipped ${counts.skipped}`,
    ...tests.map((test) => {
      const scope = test.suite === undefined ? test.name : `${test.suite} > ${test.name}`;
      const duration = test.durationMs === undefined ? '' : ` ${test.durationMs}ms`;
      const message = test.message === undefined ? '' : ` - ${test.message}`;

      return `${STATUS[test.status]} ${scope}${duration}${message}`;
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
