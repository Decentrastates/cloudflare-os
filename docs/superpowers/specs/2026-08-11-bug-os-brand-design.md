# Bug OS Brand Design

## Goal

Change the product's complete user-visible default brand from **Cloudflare OS** to **Bug OS** while preserving technical compatibility, deployment identity, and upstream attribution.

## Approved scope

- `Bug OS` is the default product and site name in English, Simplified Chinese, and Traditional Chinese.
- Replace the default hexagon mark with a distinct Bug OS bug mark in the application shell, authentication pages, editor surfaces, and favicon.
- Replace user-visible Cloudflare OS references in frontend copy, backend-provided metadata, Gatekeeper connection and OAuth pages, errors, documentation, and deployment status output.
- Keep the existing administrator overrides for site name and uploaded logo. A configured deployment name or logo continues to take precedence over the Bug OS defaults.
- Preserve internal package names, import scopes, API routes, environment variables, Docker project/container/image/volume names, repository path, current domain, database and persistent data.
- Preserve licenses, copyright notices, upstream history, links that specifically identify Cloudflare technology, and factual discussion of the upstream Cloudflare OS project where attribution is required.

## Brand presentation

The default mark is an accessible orange bug glyph in a rounded square. It must remain legible at favicon and 12–40 px UI sizes, use `currentColor` in React so existing theme colors remain authoritative, and have an explicit `Bug OS` accessible label in the favicon.

`Bug OS` is a proper name and is not translated. Surrounding fixed text remains localized through the existing English, `zh-CN`, and `zh-TW` catalogs or through backend locale resolution.

## Architecture

The shared `DEFAULT_SITE_NAME` remains the single default-name contract for frontend and backend. A reusable `BugLogo` component supplies the default mark wherever `SiteLogo` currently receives a fallback. Backend-owned Gatekeeper descriptions and OAuth HTML return Bug OS directly; the frontend must not translate backend data.

A repository brand audit test distinguishes forbidden user-visible legacy strings from allowed technical and attribution references. Tests cover the default name, default logo/fallback behavior, document title, localized backend metadata, and the static favicon.

## Acceptance criteria

1. A fresh deployment shows Bug OS across authentication, navigation, document titles, administration, Gatekeeper discovery, connector flows, errors, and favicon.
2. Simplified and Traditional Chinese views retain `Bug OS` consistently and contain no Cloudflare OS brand residue in runtime text.
3. Custom site name/logo overrides continue to work and reset to Bug OS defaults.
4. Technical identifiers, current deployment URL, persistent data, and upstream licensing are unchanged.
5. Brand audit, targeted tests, type checks, full tests, and production build pass.
