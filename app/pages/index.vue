<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const { result } = useReceiptScanner();

const items: TabsItem[] = [
    { label: "Scan", slot: "scan", icon: "i-lucide-camera" },
    { label: "Results", slot: "results", icon: "i-lucide-receipt" },
    { label: "History", slot: "history", icon: "i-lucide-clock" },
];

const activeTab = ref("scan");

watch(result, (val) => {
    if (val) activeTab.value = "results";
});
</script>

<template>
    <div class="max-w-md mx-auto min-h-dvh flex flex-col">
        <AppHeader />

        <AppTabs v-model="activeTab" :items="items">
            <template #scan>
                <ScanTab />
            </template>

            <template #results>
                <ResultsTab />
            </template>

            <template #history>
                <HistoryTab />
            </template>
        </AppTabs>
    </div>
</template>
