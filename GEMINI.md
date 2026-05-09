# beuai — Project Instructions

This project follows a strict **Domain-Driven Design (DDD)** and **Hexagonal Architecture** pattern tailored for the Nuxt/Vue ecosystem (**Vue-Native DDD**).

## Environment & Tech Stack Mandates

- **Package Manager:** ALWAYS use `pnpm`. Do not use `npm` or `yarn`.
- **Framework:** Nuxt 4 (running with `future: { compatibilityVersion: 4 }`).
- **Language:** TypeScript (Strict).
- **Styling:** Tailwind CSS (via `@nuxt/ui`).

## Architectural Mandates

### 1. Vertical Slices (Bounded Contexts)
All application logic, components, and types MUST be organized into vertical slices within `app/features/`.
- `app/features/parsing`: Orchestration of receipt scanning and AI extraction.
- `app/features/history`: Persistence and management of saved receipts.
- `app/features/export`: CSV transformation and download logic.
- `app/features/shared`: Common UI elements and cross-cutting concerns.

### 2. Composable-Driven Use Cases (Application Layer)
- **Composables** are the primary home for business logic and state.
- **Components** MUST be presentational (dumb). They bind to state and call methods exposed by composables.
- **Side-Effects** (API calls, IndexedDB) MUST be isolated into dedicated infrastructure composables (e.g., `api/useReceiptApi.ts`).

### 3. Hexagonal Adapters (Infrastructure Isolation)
- Business logic MUST NOT depend directly on external boundaries ($fetch, indexedDB, localStorage).
- Use **Ports** (interfaces or dedicated infrastructure wrappers) to decouple core logic from the implementation details of the browser or external APIs.

## Workflow Mandates: Spec-Driven Development (SDD)

We follow a strict "Test-First" cycle for all new features and bug fixes.

1.  **Spec:** Write a `.spec.ts` file for the logic/use case before implementation.
2.  **Fail:** Verify the test fails.
3.  **Implement:** Write the minimal code needed to pass the test within the appropriate feature module.
4.  **Pass:** Verify the test passes.
5.  **Refactor:** Clean up while keeping the tests green.

## Engineering Standards

- **Nuxt 4 / Vue 3:** Follow the latest Vue 3 Composition API patterns and Nuxt 4 directory conventions (e.g., placing the app in the `app/` directory).
- **Reactivity:** Embrace Vue 3 reactivity (`ref`, `computed`) inside composables. Do not use pure TypeScript for domain logic if it requires complex manual mapping to UI state.
- **Naming:** Follow the project's ubiquitous language defined in `docs/domain-language.md`.
- **Testing:** Every composable MUST have a corresponding `.spec.ts` using **Vitest**.
- **Auto-Imports:** Utilize Nuxt auto-imports from `app/features/**/composables`. Explicit imports are allowed for types.

## Domain Language
Refer to `docs/domain-language.md` for naming conventions:
- `ParsedReceipt`: Ephemeral result from AI.
- `SavedReceipt`: Persisted record with ID and timestamp.
- `ReceiptItem`: Individual line on a receipt.
- `drift`/`trusted`: Metadata for validation.

## Design, UX & Privacy Mandates

- **Internationalization (i18n):** The UI MUST be strictly language-agnostic. All user-facing strings must use `@nuxtjs/i18n` `$t()` functions mapping to `locales/*.json`. Never hardcode English text in components.
- **Privacy & Uploads:** All uploaded images (receipts) MUST be processed client-side via `browser-image-compression` to strip EXIF data (GPS, metadata) and enforce size limits (max 2MB, 2048px) prior to network transmission.
- **Progressive UX:** Multi-step async operations (like parsing) MUST provide transparent, localized progress states (e.g., "Compressing...", "Analyzing...") rather than generic loading spinners.
- **Responsive Design System:** Follow "Refactoring UI" principles: use soft, multi-layered shadows for elevation, avoid harsh borders, use typographic weight/color for hierarchy instead of just size, and ensure all mobile touch targets respect Fitts's Law (min 44px height, safe-area padded).
- **DDD-Aligned Translations:** Error messages and domain responses MUST map 1:1 from the domain constants (e.g. `ERROR_CODES`) directly to i18n JSON keys (e.g., `api_errors.NOT_A_RECEIPT`). Never hardcode English error dictionaries in composables or components.

## Source Control Policy

- **Branching:** Always create a new branch for new features, bug fixes, or architectural changes. 
- **Main Branch Protection:** NEVER commit or push directly to the `main` branch. All work must be merged into `main` via a Pull Request or local merge after verification on a feature branch.

---
*These instructions are foundational. Any architectural deviation requires a corresponding update to this document.*
