import type { ManagementSchedule } from "../src/management-types";
import type { ScheduleCadence, Weekday } from "../src/types";
import { getEmbeddedUiLocale, translateEmbeddedUi } from '@gadgets/workshop-shared/embedded-ui-i18n';

function tr(locale: string, message: string, values: Record<string, string | number> = {}): string {
  return translateEmbeddedUi(locale === 'zh-TW' ? 'zh-TW' : locale.startsWith('zh') ? 'zh-CN' : 'en', message, values);
}

const WEEKDAYS: Record<Weekday, string> = {
  SU: "Sun",
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
};

export type ScheduleTiming = {
  relative: string;
  absolute?: string;
  diagnostic?: string;
};

export function formatCadence(cadence: ScheduleCadence, locale: string = getEmbeddedUiLocale()): string {
  if (cadence.kind === "interval") return formatInterval(cadence.everyMs, locale);
  if (cadence.kind === "once") {
    const date = new Intl.DateTimeFormat(locale, {
      timeZone: cadence.timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(cadence.fireAt);
    const time = new Intl.DateTimeFormat(locale, {
      timeZone: cadence.timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(cadence.fireAt);
    return tr(locale, 'Once on {{date}} at {{time}}', { date, time });
  }

  const { rule } = cadence;
  if (rule.freq === "hourly") {
    const prefix = rule.interval === 1 ? tr(locale, 'Hourly') : tr(locale, 'Every {{count}} hours', { count: rule.interval });
    return tr(locale, '{{prefix}} at :{{minute}}', { prefix, minute: rule.minute.toString().padStart(2, '0') });
  }
  const time = formatClock(rule.hour, rule.minute, locale);
  if (rule.freq === "daily") {
    return rule.interval === 1 ? tr(locale, 'Daily at {{time}}', { time }) : tr(locale, 'Every {{count}} days at {{time}}', { count: rule.interval, time });
  }
  if (rule.interval === 1 && rule.byDay.join(",") === "MO,TU,WE,TH,FR") {
    return tr(locale, 'Weekdays at {{time}}', { time });
  }
  const days = new Intl.ListFormat(locale, { style: "short", type: "conjunction" }).format(
    rule.byDay.map((day) => locale.startsWith('zh')
      ? new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(Date.UTC(2020, 0, 5 + Object.keys(WEEKDAYS).indexOf(day)))
      : WEEKDAYS[day]),
  );
  const prefix = rule.interval === 1 ? tr(locale, 'Weekly') : tr(locale, 'Every {{count}} weeks', { count: rule.interval });
  return tr(locale, '{{prefix}} on {{days}} at {{time}}', { prefix, days, time });
}

/** Describes a finite recurrence bound and, for a counted bound, progress toward it. */
export function formatOccurrences(
  schedule: ManagementSchedule,
  locale: string = getEmbeddedUiLocale(),
): string | undefined {
  const bound = schedule.occurrences;
  if (!bound) return undefined;
  if ("count" in bound) {
    if (locale.startsWith('zh')) return tr(locale, '{{done}} of {{count}} occurrences', { done: schedule.occurrenceCount ?? 0, count: bound.count });
    const noun = bound.count === 1 ? "occurrence" : "occurrences";
    return `${schedule.occurrenceCount ?? 0} of ${bound.count} ${noun}`;
  }
  return tr(locale, 'until {{date}}', { date: formatAbsolute(bound.until, scheduleTimeZone(schedule), locale) });
}

export function formatTiming(
  schedule: ManagementSchedule,
  now = Date.now(),
  locale: string = getEmbeddedUiLocale(),
): ScheduleTiming {
  const timestamp = scheduleTimestamp(schedule);
  if (timestamp === undefined) return { relative: tr(locale, 'Next run pending') };
  const absolute = formatAbsolute(timestamp, scheduleTimeZone(schedule), locale);
  if (schedule.status === "active") {
    return {
      relative: tr(locale, 'Next run {{relative}}{{retry}}', { relative: formatRelative(timestamp - now, locale), retry: schedule.retrying ? tr(locale, ' (retry)') : '' }),
      absolute,
    };
  }
  if (schedule.status === "dead") {
    return {
      relative: tr(locale, 'Failed {{relative}}', { relative: formatRelative(schedule.failedAt - now, locale) }),
      absolute,
      diagnostic:
        schedule.failureCode === "authorization_failed"
          ? tr(locale, 'Authorization failed after retries.')
          : tr(locale, 'Task callback failed after retries.'),
    };
  }
  if (schedule.status === "completed") {
    return {
      relative: tr(locale, 'Completed {{relative}}', { relative: formatRelative(schedule.completedAt - now, locale) }),
      absolute,
      diagnostic: schedule.occurrences
        ? tr(locale, 'This recurring task used its last scheduled occurrence.')
        : tr(locale, 'This one-time task completed.'),
    };
  }
  return {
    relative: tr(locale, 'Expired {{relative}}', { relative: formatRelative(schedule.expiredAt - now, locale) }),
    absolute,
    diagnostic: schedule.cadence.kind === "once"
      ? tr(locale, 'This one-time task passed without delivery.')
      : tr(locale, "This recurring task's cutoff passed before its first occurrence."),
  };
}

function formatInterval(milliseconds: number, locale: string): string {
  const units = [
    [7 * 24 * 60 * 60_000, "week"],
    [24 * 60 * 60_000, "day"],
    [60 * 60_000, "hour"],
    [60_000, "minute"],
    [1_000, "second"],
  ] as const;
  const [unitMs, unit] = units.find(([size]) => milliseconds % size === 0) ?? [1, "millisecond"];
  const count = milliseconds / unitMs;
  if (locale.startsWith('zh')) return tr(locale, 'Every {{count}} {{unit}}', { count, unit: tr(locale, unit) });
  return `Every ${count === 1 ? unit : `${count} ${unit}s`}`;
}

function formatClock(hour: number, minute: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(Date.UTC(2020, 0, 1, hour, minute));
}

function formatRelative(milliseconds: number, locale: string): string {
  const absolute = Math.abs(milliseconds);
  const [size, unit] =
    absolute >= 24 * 60 * 60_000
      ? ([24 * 60 * 60_000, "day"] as const)
      : absolute >= 60 * 60_000
        ? ([60 * 60_000, "hour"] as const)
        : absolute >= 60_000
          ? ([60_000, "minute"] as const)
          : ([1_000, "second"] as const);
  const value = Math.round(milliseconds / size);
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(value, unit);
}

function formatAbsolute(timestamp: number, timeZone: string | undefined, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(timestamp);
}

function scheduleTimestamp(schedule: ManagementSchedule): number | undefined {
  if (schedule.status === "active") return schedule.nextFire;
  if (schedule.status === "dead") return schedule.failedAt;
  if (schedule.status === "completed") return schedule.completedAt;
  return schedule.expiredAt;
}

function scheduleTimeZone(schedule: ManagementSchedule): string | undefined {
  return schedule.cadence.kind === "interval" ? undefined : schedule.cadence.timeZone;
}
