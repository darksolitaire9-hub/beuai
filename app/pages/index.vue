<script setup lang="ts">
import { APP_TABS, type AppTabId } from "~/constants/tabs";

const activeTab = ref<AppTabId>("scan");

provide("setTab", (tab: AppTabId) => {
    activeTab.value = tab;
});

const { result } = useReceiptScanner();

watch(result, (val, prev) => {
    if (val && !prev) activeTab.value = "results";
});
</script>

<template>
    <div class="max-w-md mx-auto min-h-dvh flex flex-col">
        <AppHeader />
        <AppTabs v-model="activeTab" :items="APP_TABS">
            <template #scan><ScanTab /></template>
            <template #results><ResultsTab /></template>
            <template #history><HistoryTab /></template>
        </AppTabs>
    </div>
</template>
