# Full-Stack Internationalization Design

## Goal

Provide complete localization of Cloudflare OS in English, Simplified Chinese (`zh-CN`), and Traditional Chinese (`zh-TW`). This includes frontend copy and fixed backend-provided system metadata while leaving user content, AI output, administrator-authored names, and unknown server errors unchanged.

## Architecture

The frontend will use a small project-owned i18n layer with an English source catalog and complete Chinese catalogs. English is the canonical fallback. The layer exposes locale normalization, initial locale resolution, persistence, interpolation, locale-aware formatting, and a React provider/hook. It will not add a third-party runtime dependency.

The first visit follows the browser language: Chinese Hans/CN/SG resolves to `zh-CN`, Chinese Hant/TW/HK/MO resolves to `zh-TW`, and all other values resolve to English. A manual choice is stored in versioned local storage and takes precedence on later visits. The provider synchronizes the document `lang` attribute.

The selected locale is also passed through public and authenticated RPC capabilities. Backend adapters localize only explicitly identified built-in blueprint metadata and code-defined connector/resource descriptions. User-authored blueprint names, output labels, and other arbitrary values are never translated by text matching.

## User Experience

- A compact language selector is visible on the sign-in and sign-up screens.
- Authenticated users can switch language from the profile/settings screen.
- Switching language updates the current interface without signing out or losing route state.
- All fixed frontend copy is translated, including navigation, forms, dialogs, empty/loading/error states, toasts, accessibility labels, tooltips, billing, administration, connections, workspaces, blueprints, outputs, gatekeepers, chat controls, and onboarding.
- Brand names, usernames, workspace names, provider names, user-authored content, AI messages, administrator-configured labels, and unknown server error strings remain unchanged.
- Known client validation and fallback errors are localized.
- Dates and times use the selected locale through `Intl`.

## Catalog and Safety Rules

Translation keys are stable semantic identifiers grouped by feature. Catalog typing guarantees that both Chinese catalogs contain every English key and no unsupported keys. Interpolation escapes no markup because translations are returned as React text, never injected as HTML. Missing translations fall back to English and report the key in development.

## Testing and Completion Gates

- Unit tests cover locale normalization, browser detection, stored preference precedence, interpolation, fallback, document language synchronization, persistence, and selected-locale date formatting.
- Component tests cover the language selector and live language changes.
- A source audit detects newly introduced raw user-facing strings in the localized frontend, with explicit allowlists for code samples, identifiers, test fixtures, and dynamic content.
- A system-metadata audit verifies coverage of fixed connector, resource, format, and built-in blueprint strings.
- Regression tests enforce approved product terminology and ensure user-authored metadata cannot be localized by coincidental English text.
- Existing frontend tests, TypeScript checks, and the production frontend build must pass.
- The pre-existing Docker deployment files and `run-dev-server.js` change remain untouched by the localization work.

## Delivery Boundary

This change modifies frontend, shared RPC contracts, and backend presentation adapters. It translates only fixed system metadata, never arbitrary backend-generated or user-authored content. Deployment and push remain separate explicitly requested operations.
