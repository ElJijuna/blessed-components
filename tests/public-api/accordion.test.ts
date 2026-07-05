import { describe, expect, it } from 'vitest';

import { calculateAccordionLayout, toggleAccordionSection } from '@/index.js';

describe('Accordion', () => {
  const sections = [
    { bodyHeight: 3, id: 'build', title: 'Build' },
    { bodyHeight: 2, id: 'test', title: 'Test' },
    { bodyHeight: 1, disabled: true, id: 'deploy', title: 'Deploy' },
  ];

  it('toggles one section at a time by default', () => {
    expect(toggleAccordionSection({ expandedIds: ['build'], sectionId: 'test', sections })).toEqual(
      ['test'],
    );
    expect(toggleAccordionSection({ expandedIds: ['test'], sectionId: 'test', sections })).toEqual(
      [],
    );
  });

  it('supports multiple expanded sections with deterministic order', () => {
    expect(
      toggleAccordionSection({
        allowMultiple: true,
        expandedIds: ['build'],
        sectionId: 'test',
        sections,
      }),
    ).toEqual(['build', 'test']);
  });

  it('ignores disabled and unknown sections', () => {
    expect(
      toggleAccordionSection({ expandedIds: ['build'], sectionId: 'deploy', sections }),
    ).toEqual(['build']);
    expect(
      toggleAccordionSection({ expandedIds: ['build'], sectionId: 'missing', sections }),
    ).toEqual(['build']);
  });

  it('calculates section positions and total height', () => {
    expect(
      calculateAccordionLayout({
        expandedIds: ['build'],
        gap: 1,
        sectionGap: 1,
        sections,
      }),
    ).toEqual({
      sections: [
        {
          bodyHeight: 3,
          bodyTop: 2,
          bodyVisible: true,
          disabled: false,
          expanded: true,
          headerHeight: 1,
          id: 'build',
          top: 0,
          totalHeight: 5,
        },
        {
          bodyHeight: 0,
          bodyTop: 1,
          bodyVisible: false,
          disabled: false,
          expanded: false,
          headerHeight: 1,
          id: 'test',
          top: 6,
          totalHeight: 1,
        },
        {
          bodyHeight: 0,
          bodyTop: 1,
          bodyVisible: false,
          disabled: true,
          expanded: false,
          headerHeight: 1,
          id: 'deploy',
          top: 8,
          totalHeight: 1,
        },
      ],
      totalHeight: 9,
    });
  });

  it('rejects invalid sections and spacing', () => {
    expect(() =>
      calculateAccordionLayout({ sections: [{ bodyHeight: 1, id: '', title: 'Empty' }] }),
    ).toThrow(RangeError);
    expect(() =>
      calculateAccordionLayout({ sections: [{ bodyHeight: -1, id: 'bad', title: 'Bad' }] }),
    ).toThrow(RangeError);
    expect(() => calculateAccordionLayout({ sectionGap: 1.5, sections: [] })).toThrow(RangeError);
  });
});
