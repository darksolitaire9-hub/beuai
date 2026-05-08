<!--
  app/components/history/HistoryTab.vue | Component — orchestration only
  Renders the saved receipt list with totals, delete actions, and detail modal.
  Hydrates from IndexedDB on mount via useReceiptHistory.
  Needs: useReceiptHistory, HistoryReceiptDetail
-->

<script setup lang="ts">
import type { SavedReceipt } from "../types/receipt";
import type { ReceiptItem } from "../../parsing/types/receipt";

const { history, remove, totalSpent, totalSaved, hydrate } =
    useReceiptHistory();
const { exportAll: exportToCsv } = useCsvExport();
const toast = useToast();

const selected = ref<SavedReceipt | null>(null);
const showDetail = ref(false);

onMounted(async () => {
    try {
        await hydrate();
    } catch {
        toast.add({
            title: "Could not load history",
            description: "Storage may be unavailable.",
            color: "error",
        });
    }
});

const fmt = (n: number) => `€${n.toFixed(2)}`;
const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
const categorySummary = (items: ReceiptItem[]) =>
    [...new Set(items.map((i) => i.category.split(" ")[0]))].slice(0, 3);

function openReceipt(receipt: SavedReceipt) {
    selected.value = receipt;
    showDetail.value = true;
}

function closeDetail() {
    showDetail.value = false;
    selected.value = null;
}

async function deleteReceipt(id: string) {
    try {
        await remove(id);
        if (selected.value?.id === id) closeDetail();
        toast.add({ title: "Receipt removed", color: "neutral" });
    } catch {
        toast.add({ title: "Could not remove receipt", color: "error" });
    }
}

function exportAll() {
    const success = exportToCsv(history.value);
    if (!success) {
        toast.add({ title: "No receipts to export", color: "neutral" });
    }
}
</script>

<template>
    <div class="flex flex-col min-h-full">
        <!-- Single header — always visible -->
        <div class="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div class="flex items-center justify-between mb-1">
                <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">History</h2>
                <UButton
                    v-if="history.length"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-download"
                    size="sm"
                    label="Export CSV"
                    @click="exportAll"
                />
            </div>
            <p v-if="history.length" class="text-sm text-neutral-500 font-medium">
                {{ history.length }} items rescued · 
                <span class="text-neutral-900 dark:text-white">{{ fmt(totalSpent) }} total</span> ·
                <span class="text-success-600">{{ fmt(totalSaved) }} saved</span>
            </p>
            <p v-else class="text-sm text-neutral-500">No data rescued yet.</p>
        </div>

        <!-- Empty state -->
        <div
            v-if="!history.length"
            class="flex flex-col items-center gap-4 p-12 text-center"
        >
            <div class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-full">
                <UIcon name="i-lucide-clock" class="size-8 text-neutral-400" />
            </div>
            <div>
                <p class="text-lg font-semibold text-neutral-900 dark:text-white">Ready for rescue?</p>
                <p class="text-sm text-neutral-500 max-w-sm">
                    Scan your physical receipts to transform them into structured intelligence.
                </p>
            </div>
        </div>

        <!-- Cards list -->
        <div v-else class="grid grid-cols-1 gap-4 p-6">
            <UCard
                v-for="receipt in history"
                :key="receipt.id"
                class="hover:border-primary-500 transition-colors cursor-pointer group"
                :ui="{ body: 'p-0' }"
                @click="openReceipt(receipt)"
            >
                <div class="flex items-start justify-between p-5">
                    <div class="flex-1 min-w-0 mr-3">
                        <p class="font-bold text-neutral-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                            {{ receipt.store }}
                        </p>
                        <p class="text-xs font-medium text-neutral-500 mt-1 uppercase tracking-wider">
                            {{ formatDate(receipt.date) }}
                        </p>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <p class="text-lg font-bold tabular-nums text-neutral-900 dark:text-white">
                            {{ fmt(receipt.total_paid) }}
                        </p>
                        <UButton
                            variant="ghost"
                            color="error"
                            icon="i-lucide-trash-2"
                            size="xs"
                            class="mt-2"
                            aria-label="Delete receipt"
                            @click.stop="deleteReceipt(receipt.id)"
                        />
                    </div>
                </div>
                <div
                    class="flex gap-2 flex-wrap px-5 pb-4 pt-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800"
                >
                    <UBadge
                        variant="subtle"
                        color="neutral"
                        class="text-[10px] font-bold"
                    >
                        {{ receipt.items.length }} items
                    </UBadge>
                    <UBadge
                        v-for="cat in categorySummary(receipt.items)"
                        :key="cat"
                        variant="subtle"
                        color="neutral"
                        class="text-[10px] font-bold"
                    >
                        {{ cat }}
                    </UBadge>
                    <UBadge
                        v-if="receipt.total_savings > 0"
                        variant="subtle"
                        color="success"
                        class="text-[10px] font-bold"
                    >
                        −{{ fmt(receipt.total_savings) }}
                    </UBadge>
                </div>
            </UCard>
        </div>

        <HistoryReceiptDetail
            v-if="selected"
            :receipt="selected"
            :open="showDetail"
            @close="closeDetail"
        />
    </div>
</template>
