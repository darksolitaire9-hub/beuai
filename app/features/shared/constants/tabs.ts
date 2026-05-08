// app/features/shared/constants/tabs.ts | Constants | Shared
// Single source of truth for app tab definitions: label, value, slot, icon.

import type { TabsItem } from "@nuxt/ui";

export type AppTabId = "scan" | "results" | "history" | "analyze";

export const APP_TABS: TabsItem[] = [
  { label: "Scan", value: "scan", slot: "scan", icon: "i-lucide-camera" },
  {
    label: "Analyze",
    value: "analyze",
    slot: "analyze",
    icon: "i-lucide-bar-chart-3",
  },
  {
    label: "History",
    value: "history",
    slot: "history",
    icon: "i-lucide-clock",
  },
  {
    label: "Results",
    value: "results",
    slot: "results",
    icon: "i-lucide-receipt",
  },
];
