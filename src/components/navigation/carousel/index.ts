import { renderPlainLines } from '@/components/shared/text.js';

/** Carousel slide rendered by {@link renderCarousel}. */
export interface CarouselSlide {
  /** Slide content. */
  content: readonly string[] | string;

  /** Stable slide id. */
  id: string;

  /** Visible slide label. */
  label: string;
}

/** Options accepted by {@link renderCarousel}. */
export interface RenderCarouselOptions {
  /** Active slide index. */
  activeIndex?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Slides in visual order. */
  slides: readonly CarouselSlide[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders one carousel slide plus position metadata. */
export function renderCarousel({
  activeIndex = 0,
  height,
  slides,
  width,
}: RenderCarouselOptions): string {
  if (slides.length === 0) {
    return renderPlainLines(['0/0'], { height, width });
  }

  if (!Number.isInteger(activeIndex)) {
    throw new RangeError('Carousel activeIndex must be an integer.');
  }

  const index = Math.min(slides.length - 1, Math.max(0, activeIndex));
  const slide = slides[index];

  if (slide === undefined) {
    return renderPlainLines(['0/0'], { height, width });
  }

  const content = Array.isArray(slide.content) ? slide.content : [slide.content];

  return renderPlainLines([`${index + 1}/${slides.length} ${slide.label}`, ...content], {
    height,
    width,
  });
}
