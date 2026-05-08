<script setup lang="ts">
import { APP_TABS, type AppTabId } from "~/features/shared/constants/tabs";

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
    <AppTabs v-model="activeTab" :items="APP_TABS">
        <template #scan><ScanTab /></template>
        <template #results><ResultsTab /></template>
        <template #history><HistoryTab /></template>
        <template #analyze><AnalyzeTab /></template>
    </AppTabs>
</template>
