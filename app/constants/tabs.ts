// app/constants/tabs.ts | Constants | Shared
// Single source of truth for app tab definitions: label, value, slot, icon.
// Import APP_TABS into pages/index.vue; change tab labels, icons, or order here only.
// Needs: TabsItem (@nuxt/ui)

import type { TabsItem } from "@nuxt/ui";

export type AppTabId = "scan" | "results" | "history";

export const APP_TABS: TabsItem[] = [
  { label: "Scan", value: "scan", slot: "scan", icon: "i-lucide-camera" },
  {
    label: "Results",
    value: "results",
    slot: "results",
    icon: "i-lucide-receipt",
  },
  {
    label: "History",
    value: "history",
    slot: "history",
    icon: "i-lucide-clock",
  },
];
