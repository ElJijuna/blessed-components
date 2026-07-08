import type blessed from 'blessed';

import {
  type RenderActivityFeedOptions,
  renderActivityFeed,
} from '@/components/collections/activity-feed/index.js';
import { createRenderBox } from './render-box.js';
import type { BlessedComponentHandle } from './types.js';

export type ActivityFeedBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;
export type ActivityFeedData = Omit<RenderActivityFeedOptions, 'height' | 'width'>;
export interface ActivityFeedOptions {
  box?: ActivityFeedBoxOptions;
  data: ActivityFeedData;
  parent: blessed.Widgets.Node;
}
export type ActivityFeedHandle = BlessedComponentHandle<
  ActivityFeedData,
  blessed.Widgets.BoxElement
>;

/** Creates a render-only ActivityFeed backed by a Blessed box. */
export function activityFeed({ box, data, parent }: ActivityFeedOptions): ActivityFeedHandle {
  return createRenderBox({
    box,
    data,
    parent,
    render: (nextData, { height, width }) => renderActivityFeed({ ...nextData, height, width }),
  });
}
