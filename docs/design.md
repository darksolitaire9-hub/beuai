# beuai Design Philosophy & Architecture

## 1. Data-First Flow (Cognitive Simplification)

The core tenet of this redesign is the **removal of visual verification**. By treating the AI extraction as a trusted but auditable stream rather than a manual transcription task, we reduce "mental fatigue."

- **No Image Persistence:** We no longer store or display the captured receipt image (base64) once parsing is complete.
- **Trust-But-Verify UX:** Users focus directly on the structured data (Store, Date, Items) in the "Verification Workspace."
- **Reduced Friction:** Removing the "Visual Evidence" modal and previews streamlines the path from capture to save.

## 2. Component Composition Architecture

The application follows a strict orchestration pattern where region-specific components are managed by a centralized parent layout.

- **Orchestration:** `app/pages/index.vue` acts as the root orchestrator, managing tab state and providing navigation injection.
- **Region Isolation:**
  - `ScanTab`: Camera and Upload lifecycle.
  - `ResultsTab`: Editing and Verification workspace.
  - `HistoryTab`: Persistence and Export gateway.
  - `AnalyzeTab`: Data visualization and insights.
- **Shared State:** Business logic and cross-tab state are encapsulated in Composables (`useReceiptScanner`, `useReceiptHistory`).

## 3. Financial Aesthetics (Emerald/Slate)

The visual language is designed to feel secure, professional, and "alive."

- **Color Palette:**
  - **Primary (Emerald):** Represents growth, precision, and financial success.
  - **Neutral (Slate):** Provides a sophisticated, stable foundation that works well in both light and dark modes.
- **Typography & Spacing:** High-contrast weights and tight tracking for a modern "fintech" feel. Large, bold headers with generous whitespace to ensure mobile ergonomics (Fitts's Law).

## 4. Guardrails & Validation

Since manual visual inspection is removed, we rely on a multi-layered guardrail system to ensure data integrity:

- **Strict AI Validation:** The server-layer uses JSON Schema enforcement and domain-specific rules (e.g., `not-receipt.ts`) to reject invalid inputs.
- **Drift Detection:** We calculate the difference between line-item totals and the declared total paid. If the "drift" exceeds the tolerance (5%), the UI flags the entry as "untrusted."
- **Privacy-First Processing:** Image compression and EXIF stripping occur entirely client-side before any network transmission, ensuring GPS and personal metadata never leave the device.
