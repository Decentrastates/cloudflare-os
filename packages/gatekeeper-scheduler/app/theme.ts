import {
  applyAccentColor,
  type GatekeeperAppTheme,
} from "@gadgets/workshop-shared/theme";
import { setEmbeddedUiLocale } from "@gadgets/workshop-shared/embedded-ui-i18n";

export type ResolvedThemeMode = "light" | "dark";

export function applyThemeMode(mode: ResolvedThemeMode): void {
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode;
}

export function applyAppTheme(theme: GatekeeperAppTheme): void {
  setEmbeddedUiLocale(theme.locale);
  applyThemeMode(theme.mode);
  applyAccentColor(document.documentElement.style, theme.accentColor);
}
