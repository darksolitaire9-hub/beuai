<script setup lang="ts">
import { APP_TABS, type AppTabId } from "~/features/shared/constants/tabs";

const activeTab = ref<AppTabId>("scan");

const navItems = computed(() => APP_TABS.filter(item => item.value !== 'results'));
const isReviewMode = computed(() => activeTab.value === 'results');

provide("setTab", (tab: AppTabId) => {
    activeTab.value = tab;
});

const { result } = useReceiptScanner();

watch(result, (val, prev) => {
    if (val && !prev) activeTab.value = "results";
});
</script>

<template>
    <AppTabs v-model="activeTab" :items="navItems" :hide-nav="isReviewMode">
        <template #scan><ScanTab /></template>
        <template #results><ResultsTab /></template>
        <template #history><HistoryTab /></template>
        <template #analyze><AnalyzeTab /></template>
    </AppTabs>
</template>
