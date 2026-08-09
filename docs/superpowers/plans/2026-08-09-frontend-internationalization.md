# Full-Stack Internationalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver complete English, Simplified Chinese, and Traditional Chinese localization for every fixed user-facing frontend string and backend-provided system metadata in Cloudflare OS.

**Architecture:** Add a dependency-free typed i18n core and React provider, then migrate fixed frontend copy feature-by-feature into semantic translation keys. Persist explicit language selection, infer first-run language from the browser, route date formatting through the active locale, and pass that locale through backend RPC capabilities. Backend adapters localize only code-defined metadata or explicitly identified bundled blueprint IDs.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 4, jsdom, `Intl`

## Global Constraints

- Supported locales are exactly `en`, `zh-CN`, and `zh-TW`.
- English is the canonical fallback catalog.
- Browser language is used only when no stored preference exists.
- User content, AI output, administrator-defined names, and unknown server errors remain unchanged.
- No new runtime dependency is introduced.
- Existing Docker deployment files and `run-dev-server.js` are preserved.
- Every production behavior starts with a failing test and is verified green before the next behavior.

---

### Task 1: Locale Core and React Integration

**Files:**
- Create: `packages/workshop-frontend/src/i18n/types.ts`
- Create: `packages/workshop-frontend/src/i18n/catalogs/en.ts`
- Create: `packages/workshop-frontend/src/i18n/catalogs/zh-CN.ts`
- Create: `packages/workshop-frontend/src/i18n/catalogs/zh-TW.ts`
- Create: `packages/workshop-frontend/src/i18n/core.ts`
- Create: `packages/workshop-frontend/src/i18n/I18nContext.tsx`
- Create: `packages/workshop-frontend/src/i18n/core.test.ts`
- Create: `packages/workshop-frontend/src/i18n/I18nContext.test.tsx`
- Modify: `packages/workshop-frontend/src/main.tsx`

**Interfaces:**
- Produces: `SupportedLocale`, `TranslationKey`, `normalizeLocale(value)`, `resolveInitialLocale(storage, languages)`, `translate(locale, key, values)`, `I18nProvider`, and `useI18n()`.
- `useI18n()` returns `{ locale, setLocale, t, formatDateTime }`.

- [ ] Write tests whose literal expectations prove locale normalization for Hans/CN/SG, Hant/TW/HK/MO, English, and unsupported languages.
- [ ] Run `pnpm --filter @gadgets/workshop-frontend test -- src/i18n/core.test.ts` and verify failure because the i18n core is absent.
- [ ] Implement locale types, storage resolution, typed catalogs, interpolation, and English fallback.
- [ ] Re-run the core test and verify it passes.
- [ ] Write provider tests proving stored selection precedence, live updates, local-storage persistence, and `<html lang>` synchronization.
- [ ] Run the provider test and verify the missing provider behavior fails.
- [ ] Implement `I18nProvider`, wrap the frontend root, and verify both i18n tests pass.

### Task 2: Language Selector and Locale-Aware Formatting

**Files:**
- Create: `packages/workshop-frontend/src/i18n/LanguageSelector.tsx`
- Create: `packages/workshop-frontend/src/i18n/LanguageSelector.test.tsx`
- Modify: `packages/workshop-frontend/src/LoginPage.tsx`
- Modify: `packages/workshop-frontend/src/SignupPage.tsx`
- Modify: `packages/workshop-frontend/src/SettingsPage.tsx`
- Modify: `packages/workshop-frontend/src/utils/formatTimestamp.ts`
- Modify: `packages/workshop-frontend/src/useDocumentTitle.ts`

**Interfaces:**
- Consumes: `useI18n()` from Task 1.
- Produces: `LanguageSelector` with accessible localized label and three locale choices.

- [ ] Write a component test proving all three choices are available and changing to `zh-CN` updates visible copy without navigation or reload.
- [ ] Run the test and verify failure because the selector is absent.
- [ ] Implement the selector and mount it on authentication and profile screens.
- [ ] Add failing tests proving timestamps and document titles use the active locale.
- [ ] Route formatters and titles through i18n, then verify the selector and formatter tests pass.

### Task 3: Application Shell, Authentication, and Shared Components

**Files:**
- Modify: `packages/workshop-frontend/src/LoginPage.tsx`
- Modify: `packages/workshop-frontend/src/SignupPage.tsx`
- Modify: `packages/workshop-frontend/src/ProtectedRoute.tsx`
- Modify: `packages/workshop-frontend/src/FrontendErrorBoundary.tsx`
- Modify: `packages/workshop-frontend/src/components/AppShell/*.tsx`
- Modify: `packages/workshop-frontend/src/components/auth/*.tsx`
- Modify: `packages/workshop-frontend/src/components/UserMenu.tsx`
- Modify: `packages/workshop-frontend/src/components/Header.tsx`
- Modify: `packages/workshop-frontend/src/components/{AnnouncementBanner,AutoApproveConfirmDialog,DeleteConfirmationDialog,EmptyState,ViewToggle,WorkspaceOpenErrorPage}.tsx`
- Modify: catalogs under `packages/workshop-frontend/src/i18n/catalogs/`

**Interfaces:**
- Consumes: `useI18n().t`.
- Produces: localized shell, authentication, shared dialog, tooltip, toast, empty-state, and accessibility copy.

- [ ] Add failing focused component assertions for Simplified and Traditional Chinese shell/auth/shared UI.
- [ ] Migrate every fixed string in the listed files to semantic keys and fill both Chinese catalogs.
- [ ] Run the focused tests and then the existing frontend suite; fix only localization regressions until green.

### Task 4: Primary Routes and Account/Billing/Admin Features

**Files:**
- Modify: `packages/workshop-frontend/src/routes/*.tsx`
- Modify: `packages/workshop-frontend/src/{Activity,ActivityNotifications,AdminPage,BlueprintLandingPage,BlueprintModal,BlueprintsPage,Connections,ConnectAccountModal,GatekeeperAppPage,GatekeeperModal,OnboardingWizard,ResourcePicker,SettingsPage,VendorCard}.tsx`
- Modify: `packages/workshop-frontend/src/components/billing/*.tsx`
- Modify: `packages/workshop-frontend/src/components/format/*.tsx`
- Modify: `packages/workshop-frontend/src/gatekeeper-modal/*.tsx`
- Modify: catalogs under `packages/workshop-frontend/src/i18n/catalogs/`

**Interfaces:**
- Consumes: `useI18n().t` and locale-aware formatter.
- Produces: localized routes, profile, billing, admin, provider, connection, blueprint, output, gatekeeper, and onboarding experiences.

- [ ] Add failing assertions for representative validation, modal, toast, empty, loading, and accessibility copy in both Chinese locales.
- [ ] Migrate all fixed strings in the listed feature files while preserving server-supplied labels and unknown errors.
- [ ] Run affected tests and TypeScript checks; fix catalog or interpolation defects until green.

### Task 5: Workspace, Editor, Chat, and Remaining Frontend Copy

**Files:**
- Modify: `packages/workshop-frontend/src/{ChatInterface,CodeDiffEditor,ConnectAccountModal,FileSidebar,GadgetCodeInterface,GadgetEditor,GadgetExportMenu,GadgetUI,GadgetUseView,ResourceConfiguratorHost,SandboxedResourceConfigurator,ShareModal,TopBarNotice,WorkpiecePicker}.tsx`
- Modify: `packages/workshop-frontend/src/components/chat/*.tsx`
- Modify: every remaining frontend `.tsx` file containing fixed user-facing copy.
- Modify: catalogs under `packages/workshop-frontend/src/i18n/catalogs/`

**Interfaces:**
- Consumes: `useI18n().t`.
- Produces: localized workspace/editor/chat controls while preserving code, filenames, messages, tool output, and generated content.

- [ ] Add failing tests for fixed chat/editor controls and interpolation without asserting on AI or user content.
- [ ] Migrate all remaining fixed UI copy and complete both Chinese catalogs.
- [ ] Run all existing frontend tests and fix localization regressions until green.

### Task 6: Coverage Audit and Final Verification

**Files:**
- Create: `packages/workshop-frontend/scripts/audit-i18n.mjs`
- Create: `packages/workshop-frontend/src/i18n/audit.test.ts`
- Modify: `packages/workshop-frontend/package.json`
- Modify: `packages/workshop-frontend/src/i18n/catalogs/*.ts`

**Interfaces:**
- Produces: `pnpm --filter @gadgets/workshop-frontend i18n:audit`, which exits nonzero for untranslated fixed JSX text or user-facing literal props outside documented exclusions.

- [ ] Write a failing audit fixture test containing raw JSX text and a raw accessibility label.
- [ ] Implement the source audit with explicit exclusions for tests, generated route trees, code samples, identifiers, and dynamic content.
- [ ] Run the audit fixture and real source audit; migrate any remaining fixed copy until both pass.
- [ ] Run `pnpm --filter @gadgets/workshop-frontend test`.
- [ ] Run `pnpm --filter @gadgets/workshop-frontend types:check`.
- [ ] Run `pnpm --filter @gadgets/workshop-frontend build`.
- [ ] Inspect `git diff --check` and `git status --short` to confirm only intended localization files plus the preserved pre-existing deployment changes remain.

### Task 7: Backend System Metadata Localization

**Files:**
- Create: `packages/workshop-shared/src/i18n.ts`
- Modify: `packages/workshop-shared/src/api.ts`
- Modify: `packages/workshop-backend/src/server.ts`
- Modify: `packages/workshop-backend/src/admin-settings.ts`
- Modify: `packages/workshop-backend/src/user.ts`
- Create: `packages/workshop-frontend/scripts/audit-system-metadata.mjs`

- [ ] Pass the selected UI locale through public and authenticated RPC capabilities.
- [ ] Localize code-defined connector, resource, format, and built-in blueprint metadata.
- [ ] Restrict blueprint localization to explicit bundled IDs so user-authored titles and descriptions remain unchanged.
- [ ] Add coverage and terminology regression tests, then run frontend, backend, and shared TypeScript checks.
