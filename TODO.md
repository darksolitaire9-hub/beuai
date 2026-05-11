# Project Roadmap & Maintainability

## 🛠 Core Improvements & Maintainability
- [ ] **Strict DDD Enforcement:** Audit all feature modules for clear separation between logic (composables) and view (components).
- [ ] **Nuxt UI v4 Compliance:** Ensure all UI components leverage Nuxt UI semantic tokens and component patterns.
- [ ] **Error Handling Standardization:** Map all API and domain errors to i18n keys for 100% localized feedback.
- [ ] **Codebase Indexing for AI:** Maintain and update `GEMINI.md` files in each feature directory to assist LLM context.

## 📁 Scanning & Parsing (app/features/parsing)
- [x] **Robust Drag & Drop:** Refactor desktop upload zone to be full-screen aware and flicker-free.
- [ ] **Image Optimization Pipeline:** Enhance client-side compression to balance speed vs. AI extraction quality.
- [ ] **Scan Result Validation:** Implement visual cues for "drift" and "trusted" metadata from the parser.

## 📜 History & Management (app/features/history)
- [ ] **IndexedDB Persistence:** Solidify the storage adapter to handle large volumes of receipts safely.
- [ ] **Analytics Dashboard:** Implement data visualization for spending patterns using `@nuxt/ui` and charts.
- [ ] **Export Logic:** Refine CSV export to include all line-item details.

## 🧪 Testing & Quality Assurance
- [x] **Unit Tests:** Achieve 100% coverage for business logic in composables (`useReceiptScanner`, `useReceiptHistory`).
- [x] **E2E Smoke Tests:** Implement Playwright tests for the full "Scan -> Save -> View" happy path and multi-locale verification.
- [ ] **Performance Benchmarks:** Monitor and optimize LCP (Largest Contentful Paint) for the scan tab.

## 🚀 Deployment & CI/CD
- [ ] **CI Pipeline:** Run full suite (Vitest + Playwright) successfully on push.
- [ ] **Security Validation:** Ensure no critical findings in pre-commit/CI static analysis.
