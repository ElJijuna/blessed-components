import {
  type CollapsibleLayout,
  calculateCollapsibleLayout,
} from '@/components/layout/collapsible/index.js';

/** Minimum data required for one Accordion section. */
export interface AccordionSection {
  /** Intrinsic body height in terminal rows. */
  bodyHeight: number;

  /** Whether keyboard navigation and toggling must skip this section. */
  disabled?: boolean;

  /** Stable section identifier. */
  id: string;

  /** Non-empty, single-line section title. */
  title: string;
}

/** Options accepted by {@link toggleAccordionSection}. */
export interface ToggleAccordionSectionOptions<
  TSection extends AccordionSection = AccordionSection,
> {
  /** Whether more than one section may be expanded. @defaultValue `false` */
  allowMultiple?: boolean;

  /** Current expanded section identifiers. */
  expandedIds?: readonly string[];

  /** Section to toggle. Disabled or unknown sections leave state unchanged. */
  sectionId: string;

  /** Ordered sections. */
  sections: readonly TSection[];
}

/** Options accepted by {@link calculateAccordionLayout}. */
export interface CalculateAccordionLayoutOptions<
  TSection extends AccordionSection = AccordionSection,
> {
  /** Current expanded section identifiers. */
  expandedIds?: readonly string[];

  /** Empty rows between header and body while a section is expanded. @defaultValue `0` */
  gap?: number;

  /** Empty rows between adjacent sections. @defaultValue `0` */
  sectionGap?: number;

  /** Ordered sections. */
  sections: readonly TSection[];
}

/** Positioned section returned by {@link calculateAccordionLayout}. */
export interface AccordionSectionLayout extends CollapsibleLayout {
  /** Whether the section is disabled. */
  disabled: boolean;

  /** Whether the section is currently expanded. */
  expanded: boolean;

  /** Stable section identifier. */
  id: string;

  /** Section top position in terminal rows. */
  top: number;
}

/** Full layout returned by {@link calculateAccordionLayout}. */
export interface AccordionLayout {
  /** Positioned sections in visual order. */
  sections: AccordionSectionLayout[];

  /** Total visible height in terminal rows. */
  totalHeight: number;
}

function validateSection(section: AccordionSection): void {
  if (section.id.length === 0 || /[\r\n]/u.test(section.id)) {
    throw new RangeError('Accordion section ids must be non-empty and fit on one line.');
  }

  if (section.title.length === 0 || /[\r\n]/u.test(section.title)) {
    throw new RangeError('Accordion section titles must be non-empty and fit on one line.');
  }
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function normalizeExpandedIds<TSection extends AccordionSection>(
  sections: readonly TSection[],
  expandedIds: readonly string[] = [],
): string[] {
  const enabledIds = new Set(
    sections.filter(({ disabled }) => disabled !== true).map(({ id }) => id),
  );
  const normalized: string[] = [];

  for (const id of expandedIds) {
    if (enabledIds.has(id) && !normalized.includes(id)) {
      normalized.push(id);
    }
  }

  return normalized;
}

/**
 * Toggles one Accordion section while preserving deterministic identifier order.
 */
export function toggleAccordionSection<TSection extends AccordionSection>({
  allowMultiple = false,
  expandedIds,
  sectionId,
  sections,
}: ToggleAccordionSectionOptions<TSection>): string[] {
  for (const section of sections) {
    validateSection(section);
    validateDimension(section.bodyHeight, 'Accordion section body height');
  }

  const section = sections.find(({ id }) => id === sectionId);

  if (section === undefined || section.disabled === true) {
    return normalizeExpandedIds(sections, expandedIds);
  }

  const normalized = normalizeExpandedIds(sections, expandedIds);
  const isExpanded = normalized.includes(sectionId);

  if (!allowMultiple) {
    return isExpanded ? [] : [sectionId];
  }

  return isExpanded ? normalized.filter((id) => id !== sectionId) : [...normalized, sectionId];
}

/**
 * Calculates vertical positions for an Accordion without mutating terminal state.
 */
export function calculateAccordionLayout<TSection extends AccordionSection>({
  expandedIds,
  gap = 0,
  sectionGap = 0,
  sections,
}: CalculateAccordionLayoutOptions<TSection>): AccordionLayout {
  validateDimension(gap, 'Accordion gap');
  validateDimension(sectionGap, 'Accordion section gap');

  const normalizedExpandedIds = normalizeExpandedIds(sections, expandedIds);
  const layouts: AccordionSectionLayout[] = [];

  let cursor = 0;

  for (const section of sections) {
    validateSection(section);
    validateDimension(section.bodyHeight, 'Accordion section body height');

    const expanded = normalizedExpandedIds.includes(section.id);
    const layout = calculateCollapsibleLayout({
      bodyHeight: section.bodyHeight,
      expanded,
      gap,
    });

    layouts.push({
      ...layout,
      disabled: section.disabled === true,
      expanded,
      id: section.id,
      top: cursor,
    });
    cursor += layout.totalHeight + sectionGap;
  }

  return {
    sections: layouts,
    totalHeight: layouts.length === 0 ? 0 : cursor - sectionGap,
  };
}
