import { describe, expect, it } from 'vitest';

import { renderCarousel } from '@/index.js';

describe('Carousel', () => {
  it('renders active slide with position metadata', () => {
    expect(
      renderCarousel({
        activeIndex: 1,
        slides: [
          { content: 'First', id: 'one', label: 'One' },
          { content: ['Second', 'Details'], id: 'two', label: 'Two' },
        ],
      }),
    ).toBe(['2/2 Two', 'Second', 'Details'].join('\n'));
  });
});
