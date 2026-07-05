import blessed from 'blessed';

import {
  type AccordionSection,
  calculateAccordionLayout,
  toggleAccordionSection,
} from '@/components/layout/accordion/index.js';
import type { CollapsibleCharacters } from '@/components/layout/collapsible/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import {
  type CollapsibleBodyOptions,
  type CollapsibleData,
  type CollapsibleHandle,
  type CollapsibleHeaderOptions,
  collapsible,
} from './collapsible.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the Accordion root. */
export type AccordionBoxOptions = BoxElementOptions;

/** Section data accepted by the Blessed {@link accordion} adapter. */
export interface AccordionDataSection extends AccordionSection {
  /** Plain text body content managed by the adapter. */
  content?: string;
}

/** Stateful data accepted by the Blessed {@link accordion} adapter. */
export interface AccordionData extends BoxData {
  /** Whether more than one section may be expanded. @defaultValue `false` */
  allowMultiple?: boolean;

  /** Character tokens used by each section header. */
  characters?: CollapsibleCharacters;

  /** Initial expanded section identifiers for uncontrolled usage. */
  defaultExpandedIds?: readonly string[];

  /** Controlled expanded section identifiers. */
  expandedIds?: readonly string[];

  /** Empty rows between each header and body while expanded. @defaultValue `0` */
  gap?: number;

  /** Called after keyboard, mouse, or imperative toggling requests expansion changes. */
  onExpandedIdsChange?: (expandedIds: string[]) => void;

  /** Empty rows between adjacent sections. @defaultValue `0` */
  sectionGap?: number;

  /** Ordered Accordion sections. */
  sections: readonly AccordionDataSection[];
}

/** Options accepted by the Blessed {@link accordion} adapter. */
export interface AccordionOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: AccordionBoxOptions;

  /** Optional body element settings applied to every section. */
  body?: CollapsibleBodyOptions;

  /** Sections, state, callbacks, and semantic theme data. */
  data: AccordionData;

  /** Optional header element settings applied to every section. */
  header?: CollapsibleHeaderOptions;

  /** Blessed screen or node receiving the Accordion root. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link accordion}. */
export interface AccordionHandle
  extends BlessedComponentHandle<AccordionData, blessed.Widgets.BoxElement> {
  /** Returns the currently focused section identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the focused or first enabled section header. */
  focus(): void;

  /** Moves focus to a section identifier. */
  focusSection(id: string): string | undefined;

  /** Moves focus to the next enabled section, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus to the previous enabled section, wrapping at the start. */
  previous(): string | undefined;

  /** Returns mounted section handles keyed by section id. */
  sections(): ReadonlyMap<string, CollapsibleHandle>;

  /** Sets one section expanded state and reports whether setting occurred. */
  setSectionExpanded(id: string, expanded: boolean): boolean;

  /** Toggles the focused section and reports whether toggling occurred. */
  toggleFocused(): boolean;

  /** Returns the current controlled or uncontrolled expanded identifiers. */
  value(): readonly string[];
}

interface Keypress {
  full?: string;
  name?: string;
}

function sameSectionIds(
  previous: readonly AccordionDataSection[],
  next: readonly AccordionDataSection[],
) {
  return (
    previous.length === next.length &&
    previous.every((section, index) => section.id === next[index]?.id)
  );
}

function firstEnabled(sections: readonly AccordionDataSection[]): string | undefined {
  return sections.find(({ disabled }) => disabled !== true)?.id;
}

function enabledIds(sections: readonly AccordionDataSection[]): string[] {
  return sections.filter(({ disabled }) => disabled !== true).map(({ id }) => id);
}

/** Creates a keyboard accessible Accordion backed by Blessed boxes. */
export function accordion({
  body: bodyOptions,
  box: rootOptions,
  data: initialData,
  header: headerOptions,
  parent,
}: AccordionOptions): AccordionHandle {
  let data = initialData;
  let focusedId = firstEnabled(initialData.sections);
  let uncontrolledExpandedIds = [...(initialData.defaultExpandedIds ?? [])];
  let sectionHandles = new Map<string, CollapsibleHandle>();

  const element = blessed.box({
    ...rootOptions,
    content: '',
    parent,
    style: {
      ...rootOptions?.style,
      border: { ...rootOptions?.style?.border },
    },
    tags: false,
  });
  const style = createBoxStyleController(element, rootOptions);
  const isControlled = (): boolean => Object.hasOwn(data, 'expandedIds');
  const currentExpandedIds = (): readonly string[] =>
    isControlled() ? (data.expandedIds ?? []) : uncontrolledExpandedIds;
  const focusSection = (id: string): string | undefined => {
    if (!data.sections.some((section) => section.id === id && section.disabled !== true)) {
      return focusedId;
    }

    focusedId = id;
    sectionHandles.get(id)?.focus();

    return focusedId;
  };
  const move = (direction: 1 | -1): string | undefined => {
    const ids = enabledIds(data.sections);

    if (ids.length === 0) {
      return undefined;
    }

    const currentIndex = Math.max(0, ids.indexOf(focusedId ?? ids[0] ?? ''));
    const nextIndex = (currentIndex + direction + ids.length) % ids.length;
    const nextId = ids[nextIndex] ?? ids[0];

    return nextId === undefined ? undefined : focusSection(nextId);
  };
  const sectionData = (section: AccordionDataSection, expanded: boolean): CollapsibleData => ({
    bodyHeight: section.bodyHeight,
    ...(data.characters === undefined ? {} : { characters: data.characters }),
    ...(section.content === undefined ? {} : { content: section.content }),
    disabled: section.disabled === true,
    expanded,
    ...(data.gap === undefined ? {} : { gap: data.gap }),
    onExpandedChange: (nextExpanded) => {
      setSectionExpanded(section.id, nextExpanded);
    },
    title: section.title,
  });
  const layout = (): void => {
    const positions = calculateAccordionLayout({
      expandedIds: currentExpandedIds(),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      ...(data.sectionGap === undefined ? {} : { sectionGap: data.sectionGap }),
      sections: data.sections,
    });

    for (const position of positions.sections) {
      const handle = sectionHandles.get(position.id);

      if (handle === undefined) {
        continue;
      }

      handle.element.top = position.top;
      handle.element.left = 0;
      handle.element.right = 0;
      handle.element.height = position.totalHeight;
      const section = data.sections.find(({ id }) => id === position.id);

      if (section !== undefined) {
        handle.setData(sectionData(section, position.expanded));
      }
    }
  };
  const syncRootStyle = (): void => {
    const { backgroundTone, borderTone, capabilities, theme } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      theme,
    });
  };
  const commitExpandedIds = (nextExpandedIds: string[]): boolean => {
    if (!isControlled()) {
      uncontrolledExpandedIds = nextExpandedIds;
    }

    data.onExpandedIdsChange?.([...nextExpandedIds]);
    layout();

    return true;
  };
  const setSectionExpanded = (id: string, expanded: boolean): boolean => {
    const section = data.sections.find((candidate) => candidate.id === id);

    if (section === undefined || section.disabled === true) {
      return false;
    }

    const current = currentExpandedIds();

    if (current.includes(id) === expanded) {
      return true;
    }

    const nextExpandedIds = toggleAccordionSection({
      allowMultiple: data.allowMultiple === true,
      expandedIds: current,
      sectionId: id,
      sections: data.sections,
    });

    return commitExpandedIds(nextExpandedIds);
  };
  const createSections = (): void => {
    for (const handle of sectionHandles.values()) {
      handle.destroy();
    }

    sectionHandles = new Map(
      data.sections.map((section) => [
        section.id,
        collapsible({
          ...(bodyOptions === undefined ? {} : { body: bodyOptions }),
          box: { height: 1 },
          data: sectionData(section, currentExpandedIds().includes(section.id)),
          ...(headerOptions === undefined ? {} : { header: headerOptions }),
          parent: element,
        }),
      ]),
    );

    for (const [id, handle] of sectionHandles) {
      handle.header.on('keypress', (_character: string, key: Keypress) => {
        switch (key.full ?? key.name) {
          case 'down':
            move(1);
            break;
          case 'end':
            focusSection(enabledIds(data.sections).at(-1) ?? id);
            break;
          case 'home':
            focusSection(enabledIds(data.sections)[0] ?? id);
            break;
          case 'up':
            move(-1);
            break;
        }
      });
      handle.header.on('focus', () => {
        focusedId = id;
      });
      const section = data.sections.find((candidate) => candidate.id === id);

      if (section !== undefined) {
        handle.setData(sectionData(section, currentExpandedIds().includes(id)));
      }
    }
  };
  const render = (): void => {
    syncRootStyle();
    layout();
  };

  createSections();
  render();

  const handle: AccordionHandle = {
    activeId: () => focusedId,
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      focusSection(focusedId ?? firstEnabled(data.sections) ?? '');
    },
    focusSection,
    next: () => move(1),
    previous: () => move(-1),
    sections: () => sectionHandles,
    setData(nextData) {
      const previousSections = data.sections;

      data = nextData;

      if (isControlled()) {
        uncontrolledExpandedIds = [];
      } else if (nextData.defaultExpandedIds !== undefined) {
        uncontrolledExpandedIds = [...nextData.defaultExpandedIds];
      }

      if (!sameSectionIds(previousSections, nextData.sections)) {
        focusedId = firstEnabled(nextData.sections);
        createSections();
      }

      if (focusedId !== undefined && !enabledIds(nextData.sections).includes(focusedId)) {
        focusedId = firstEnabled(nextData.sections);
      }

      render();
    },
    setSectionExpanded,
    toggleFocused() {
      return focusedId === undefined
        ? false
        : setSectionExpanded(focusedId, !currentExpandedIds().includes(focusedId));
    },
    value: currentExpandedIds,
  };

  element.on('resize', render);

  return handle;
}
