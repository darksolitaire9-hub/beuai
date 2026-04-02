<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const { result } = useReceiptScanner();

const items: TabsItem[] = [
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

const activeTab = ref("scan");

watch(result, (val, prev) => {
    if (val && !prev) activeTab.value = "results";
});

provide("setTab", (tab: string) => {
    activeTab.value = tab;
});
</script>

<template>
    <div class="max-w-md mx-auto min-h-dvh flex flex-col">
        <AppHeader />
        <AppTabs v-model="activeTab" :items="items">
            <template #scan><ScanTab /></template>
            <template #results><ResultsTab /></template>
            <template #history><HistoryTab /></template>
        </AppTabs>
    </div>
</template>
