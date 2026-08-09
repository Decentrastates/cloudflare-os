// Locale-aware timestamp formatting for chat UI tooltips.
//
// `Intl.DateTimeFormat(undefined, ...)` uses the browser's preferred locale, which already encodes
// the user's 12h vs 24h preference (e.g. en-US -> 12h, en-GB -> 24h, en-US-u-hc-h23 -> 24h). We
// intentionally do not pass `hour12` or `hourCycle` so the OS/browser setting wins.
//
// The formatter instance is cached at module scope because constructing `Intl.DateTimeFormat` is
// surprisingly expensive and a chat view can render hundreds of timestamps.
import { getActiveLocale } from '../i18n/core'

const fullTimestampFormatters = new Map<string, Intl.DateTimeFormat>();

function getFullTimestampFormatter(): Intl.DateTimeFormat {
  const locale = getActiveLocale()
  let formatter = fullTimestampFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
    fullTimestampFormatters.set(locale, formatter)
  }
  return formatter;
}

/**
 * Format a date as a locale-aware short date + time, e.g. "5/11/26, 5:09 PM" (en-US) or
 * "11/05/2026, 17:09" (en-GB). Intended for chat timestamp tooltips that need to disambiguate
 * which day a message belongs to.
 */
export function formatFullTimestamp(date: Date): string {
  return getFullTimestampFormatter().format(date);
}
