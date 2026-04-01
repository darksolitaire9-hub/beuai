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
        <header
            class="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-default/80 backdrop-blur border-b border-default"
        >
            <div class="flex items-center gap-2 font-bold text-sm">
                <UIcon name="i-lucide-scan-line" class="text-primary size-5" />
                Bills OCR
            </div>
            <UColorModeButton  />
        </header>

        <UTabs
            v-model="activeTab"
            :items="items"
            variant="link"
            class="flex-1 flex flex-col"
            :ui="{
                root: 'flex flex-col flex-1',
                list: 'sticky top-[53px] z-40 bg-default border-b border-default rounded-none px-0',
                trigger: 'grow rounded-none',
                content: 'flex-1 overflow-y-auto',
            }"
        >
            <template #scan><ScanTab /></template>
            <template #results><ResultsTab /></template>
            <template #history><HistoryTab /></template>
        </UTabs>
    </div>
</template>
