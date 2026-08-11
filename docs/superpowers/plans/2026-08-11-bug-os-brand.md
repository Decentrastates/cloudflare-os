# Bug OS Brand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every user-visible default Cloudflare OS brand surface with Bug OS without changing technical identities or user data.

**Architecture:** Keep `DEFAULT_SITE_NAME` as the shared naming contract, add one reusable default `BugLogo`, and update fixed backend metadata at its authoritative sources. Protect the boundary with a brand-audit test that permits technical identifiers and upstream attribution while rejecting runtime-facing legacy branding.

**Tech Stack:** TypeScript, React, Vite, Vitest, Node test runner, Workers/workerd, SVG.

## Global Constraints

- The default visible brand is exactly `Bug OS` in all supported locales.
- Frontend code must not translate backend-provided metadata.
- Admin-configured site name and logo overrides must continue to take precedence.
- Do not rename `@gadgets/*`, environment variables, API routes, Docker resources, repository paths, current domain, or persistence resources.
- Preserve licenses, copyright notices, upstream history, and references that describe Cloudflare technologies or the upstream project.

---

### Task 1: Brand contract and audit guard

**Files:**
- Modify: `packages/workshop-shared/src/api.ts`
- Create: `scripts/brand-audit.test.js`
- Modify: `packages/workshop-frontend/src/useWorkspaceOpen.test.tsx`

**Interfaces:**
- Produces: `DEFAULT_SITE_NAME === "Bug OS"` for every frontend/backend consumer.
- Produces: a repository test that rejects legacy user-visible brand text in runtime source and assets.

- [x] **Step 1: Add failing assertions for the Bug OS default and forbidden legacy runtime strings.**
- [x] **Step 2: Run the shared/frontend tests and root Node tests; verify the new expectations fail.**
- [x] **Step 3: Change the shared default and comments, and implement the narrow brand audit allowlist.**
- [x] **Step 4: Run the same tests; verify they pass.**

### Task 2: Default visual identity

**Files:**
- Create: `packages/workshop-frontend/src/components/BugLogo.tsx`
- Create: `packages/workshop-frontend/src/components/BugLogo.test.tsx`
- Modify: `packages/workshop-frontend/src/components/Header.tsx`
- Modify: `packages/workshop-frontend/src/components/AppShell/Sidebar.tsx`
- Modify: `packages/workshop-frontend/src/SignupPage.tsx`
- Modify: `packages/workshop-frontend/src/GadgetEditor.tsx`
- Modify: `packages/workshop-frontend/src/GadgetUseView.tsx`
- Modify: `packages/workshop-frontend/src/OnboardingWizard.tsx`
- Modify: `packages/workshop-frontend/public/favicon.svg`
- Modify: `packages/workshop-frontend/index.html`

**Interfaces:**
- Produces: `BugLogo({ size, className })` using an accessible SVG and `currentColor`.
- Consumes: unchanged `SiteLogo` override/fallback contract.

- [x] **Step 1: Add a failing component test for the default Bug OS mark and its size/color contract.**
- [x] **Step 2: Run the targeted test; verify it fails because `BugLogo` does not exist.**
- [x] **Step 3: Implement `BugLogo`, replace only product-brand fallback hexagons, and update favicon/title.**
- [x] **Step 4: Run logo, site-logo, authentication, and title tests.**

### Task 3: Backend and connector brand copy

**Files:**
- Modify: `packages/gatekeeper-*/src/*.ts`
- Modify: `packages/gatekeeper-context/app/ContextLibraryPage.tsx`
- Modify: `packages/mcp-shared/src/endpoint.ts`
- Modify: `packages/workshop-shared/src/i18n.ts`
- Modify: relevant Gatekeeper and shared i18n tests.

**Interfaces:**
- Produces: backend-returned fixed descriptions, OAuth HTML, and errors containing Bug OS directly.
- Preserves: locale selection and the rule that frontend consumers render backend metadata verbatim.

- [x] **Step 1: Extend backend localization tests to require Bug OS in English, Simplified Chinese, and Traditional Chinese metadata.**
- [x] **Step 2: Run targeted tests; verify legacy-name expectations fail.**
- [x] **Step 3: Replace legacy brand copy at authoritative backend sources and catalogs.**
- [x] **Step 4: Run Gatekeeper and shared localization tests.**

### Task 4: Documentation and operational messages

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `deploy/apps/README.md`
- Modify: `deploy/apps/deploy.sh`
- Modify: `deploy/auto-macmini/README.md`
- Modify: `deploy/auto-macmini/deploy.sh`

**Interfaces:**
- Produces: Bug OS-facing documentation and operator status messages.
- Preserves: Cloudflare Workers/workerd terminology, upstream attribution, URLs, and technical deployment identifiers.

- [x] **Step 1: Replace product-name prose and operator-visible messages while retaining factual upstream/technology references.**
- [x] **Step 2: Run shell syntax checks and the brand audit.**

### Task 5: Full verification and review

**Files:**
- Verify all modified files.

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: evidence that the approved design is complete and safe to ship.

- [x] **Step 1: Run the equivalent package-local test/type gates, lint, and production build without changing the locked dependency graph.**
- [x] **Step 2: Run `git diff --check`, inspect the complete diff, and scan for secrets or accidental technical renames.**
- [x] **Step 3: Inspect the production artifact and run brand scans across authentication, shell, Gatekeepers, title, favicon, and all three locales; deployment remains a separate governed operation.**
- [x] **Step 4: Request code review, fix all Critical and Important findings, and rerun affected gates.**
- [x] **Step 5: Create a Conventional Commit containing only the intended branding work.**
