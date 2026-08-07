import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Character tokens used by {@link renderSlider}. */
export interface SliderCharacters {
  /** Track cell rendered after the thumb. */
  empty: string;

  /** Track cell rendered before the thumb. */
  filled: string;

  /** Marker rendered when interaction is unavailable. */
  disabled: string;

  /** Marker rendered when the slider owns terminal focus. */
  focused: string;

  /** Movable value indicator. */
  thumb: string;
}

/** Numeric range shared by Slider renderers and adapters. */
export interface SliderRangeOptions {
  /** Inclusive upper bound. @defaultValue `100` */
  max?: number;

  /** Inclusive lower bound. @defaultValue `0` */
  min?: number;

  /** Positive increment anchored at `min`. @defaultValue `1` */
  step?: number;
}

/** Normalized value information passed to a Slider formatter. */
export interface SliderValueContext {
  /** Rounded position in the inclusive range from 0 to 100. */
  percentage: number;

  /** Value after clamping and step alignment. */
  value: number;
}

/** Options accepted by {@link renderSlider}. */
export interface RenderSliderOptions extends SliderRangeOptions {
  /** Character tokens used for the track and state markers. */
  characters?: SliderCharacters;

  /** Whether focus and value changes are unavailable. */
  disabled?: boolean;

  /** Formats the text shown after the track. Return an empty string to hide it. */
  formatValue?: (context: SliderValueContext) => string;

  /** Whether the slider currently owns terminal focus. */
  focused?: boolean;

  /** Persistent, non-empty, single-line accessible label. */
  label: string;

  /** Current numeric value. Values are clamped and aligned to `step`. */
  value: number;

  /** Number of terminal cells reserved for the track, including the thumb. */
  width: number;
}

const DEFAULT_CHARACTERS: SliderCharacters = {
  disabled: '×',
  empty: '─',
  filled: '━',
  focused: '›',
  thumb: '●',
};
const DEFAULT_MAX = 100;
const DEFAULT_MIN = 0;
const DEFAULT_STEP = 1;

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function decimalPlaces(value: number): number {
  const match = String(value)
    .toLowerCase()
    .match(/(?:\.(\d+))?(?:e([+-]?\d+))?$/u);
  const fractionLength = match?.[1]?.length ?? 0;
  const exponent = Number(match?.[2] ?? 0);

  return Math.min(12, Math.max(0, fractionLength - exponent));
}

function validateRange({
  max = DEFAULT_MAX,
  min = DEFAULT_MIN,
  step = DEFAULT_STEP,
}: SliderRangeOptions): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('Slider max must be greater than min.');
  }

  if (!Number.isFinite(step) || step <= 0) {
    throw new RangeError('Slider step must be a positive finite number.');
  }
}

function validateCharacter(name: keyof SliderCharacters, value: string): void {
  if (value !== plainText(value) || /[\r\n]/u.test(value) || visibleWidth(value) !== 1) {
    throw new RangeError(`Slider characters.${name} must be one plain terminal cell.`);
  }
}

function normalizeOneLine(name: string, value: string, allowEmpty = false): string {
  const normalized = plainText(value);

  if ((!allowEmpty && normalized.length === 0) || /[\r\n]/u.test(normalized)) {
    throw new RangeError(
      `Slider ${name} must ${allowEmpty ? 'fit' : 'be non-empty and fit'} on one line.`,
    );
  }

  return normalized;
}

/** Clamps a value to the range and aligns it to the nearest step anchored at `min`. */
export function normalizeSliderValue(
  value: number,
  { max = DEFAULT_MAX, min = DEFAULT_MIN, step = DEFAULT_STEP }: SliderRangeOptions = {},
): number {
  validateRange({ max, min, step });

  if (!Number.isFinite(value)) {
    throw new RangeError('Slider value must be finite.');
  }

  const clamped = Math.min(max, Math.max(min, value));

  if (clamped === min || clamped === max) {
    return clamped;
  }

  const stepped = Math.min(max, Math.max(min, min + Math.round((clamped - min) / step) * step));
  const precision = Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step));

  return Number(stepped.toFixed(precision));
}

/** Renders a labeled horizontal slider with visible focus and disabled cues. */
export function renderSlider({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  formatValue = ({ value }) => String(value),
  focused = false,
  label,
  max = DEFAULT_MAX,
  min = DEFAULT_MIN,
  step = DEFAULT_STEP,
  value,
  width,
}: RenderSliderOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Slider width must be a positive integer.');
  }

  for (const [name, character] of Object.entries(characters) as [
    keyof SliderCharacters,
    string,
  ][]) {
    validateCharacter(name, character);
  }

  const normalizedLabel = normalizeOneLine('label', label);
  const normalizedValue = normalizeSliderValue(value, { max, min, step });
  const percentage = Math.round(((normalizedValue - min) / (max - min)) * 100);
  const thumbIndex = Math.round((percentage / 100) * (width - 1));
  const track = Array.from({ length: width }, (_, index) => {
    if (index < thumbIndex) {
      return characters.filled;
    }

    return index === thumbIndex ? characters.thumb : characters.empty;
  }).join('');
  const valueText = normalizeOneLine(
    'formatted value',
    formatValue({ percentage, value: normalizedValue }),
    true,
  );
  const stateMarker = disabled ? characters.disabled : focused ? characters.focused : ' ';
  const valueSuffix = valueText.length === 0 ? '' : ` ${valueText}`;
  const disabledSuffix = disabled ? ' (disabled)' : '';

  return `${normalizedLabel}:\n${stateMarker} ${track}${valueSuffix}${disabledSuffix}`;
}
