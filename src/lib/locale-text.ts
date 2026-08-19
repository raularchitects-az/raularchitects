/** CSS `text-transform: uppercase` uses English i→I and skips Azerbaijani İ. */
export function toDisplayUpperCase(text: string, locale: string): string {
  return text.toLocaleUpperCase(locale);
}
