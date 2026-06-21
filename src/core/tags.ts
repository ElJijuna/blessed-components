const BLESSED_TAG_PATTERN = /(?<!\\)\{\/?[a-zA-Z0-9_-]+\}/g;

/**
 * Escapes opening braces so dynamic text cannot be interpreted as Blessed
 * tags.
 */
export function escapeBlessedTags(value: string): string {
  return value.replace(/(?<!\\)\{/g, '\\{');
}

/**
 * Removes Blessed formatting tags from text.
 */
export function stripBlessedTags(value: string): string {
  return value.replace(BLESSED_TAG_PATTERN, '').replaceAll('\\{', '{');
}
