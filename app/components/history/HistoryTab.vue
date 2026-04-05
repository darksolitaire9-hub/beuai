<!--
  app/components/history/HistoryTab.vue | Component — orchestration only
  Renders the saved receipt list with totals, delete actions, and detail modal.
  Hydrates from IndexedDB on mount via useReceiptHistory.
  Needs: useReceiptHistory, HistoryReceiptDetail
-->

<script setup lang="ts">
import type { ReceiptItem, SavedReceipt } from "~/types/receipt";
import { buildReceiptsCsv, downloadCsv } from "~/utils/exportReceiptsCsv";

const { history, remove, totalSpent, totalSaved, hydrate } =
    useReceiptHistory();
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
    if (!history.value.length) {
        toast.add({ title: "No receipts to export", color: "neutral" });
        return;
    }
    const csv = buildReceiptsCsv(history.value);
    const filename = `beuai-receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csv, filename);
}
</script>

<template>
    <div class="flex flex-col">
        <!-- Single header — always visible -->
        <div class="px-4 pt-5 pb-3 border-b border-default">
            <div class="flex items-center justify-between mb-0.5">
                <h2 class="text-lg font-bold">History</h2>
                <UButton
                    v-if="history.length"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-download"
                    size="xs"
                    aria-label="Export all receipts as CSV"
                    @click="exportAll"
                >
                    Export CSV
                </UButton>
            </div>
            <p v-if="history.length" class="text-sm text-muted">
                {{ history.length }} receipt{{
                    history.length > 1 ? "s" : ""
                }}
                · {{ fmt(totalSpent) }} total ·
                <span class="text-success">{{ fmt(totalSaved) }} saved</span>
            </p>
            <p v-else class="text-sm text-muted">No receipts saved yet.</p>
        </div>

        <!-- Empty state -->
        <div
            v-if="!history.length"
            class="flex flex-col items-center gap-4 p-12 text-center"
        >
            <UIcon name="i-lucide-clock" class="size-10 text-faint" />
            <div>
                <p class="font-semibold mb-1">No receipts yet</p>
                <p class="text-sm text-muted max-w-[26ch]">
                    Scan your first receipt and save it here.
                </p>
            </div>
        </div>

        <!-- Cards list — v-else directly follows v-if above -->
        <div v-else class="flex flex-col gap-3 p-4">
            <UCard
                v-for="receipt in history"
                :key="receipt.id"
                class="active:scale-[0.99] transition-transform cursor-pointer"
                :ui="{ body: 'p-0' }"
                @click="openReceipt(receipt)"
            >
                <div class="flex items-start justify-between p-4">
                    <div class="flex-1 min-w-0 mr-3">
                        <p class="font-semibold truncate">
                            {{ receipt.store }}
                        </p>
                        <p class="text-xs text-muted mt-0.5">
                            {{ formatDate(receipt.date) }}
                        </p>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <p class="text-lg font-bold tabular-nums">
                            {{ fmt(receipt.total_paid) }}
                        </p>
                        <UButton
                            variant="ghost"
                            color="error"
                            icon="i-lucide-trash-2"
                            size="xs"
                            class="mt-1"
                            aria-label="Delete receipt"
                            @click.stop="deleteReceipt(receipt.id)"
                        />
                    </div>
                </div>
                <div
                    class="flex gap-1.5 flex-wrap px-4 pb-3 border-t border-default pt-2"
                >
                    <UBadge
                        variant="subtle"
                        color="neutral"
                        :label="`${receipt.items.length} items`"
                    />
                    <UBadge
                        v-for="cat in categorySummary(receipt.items)"
                        :key="cat"
                        variant="subtle"
                        color="neutral"
                        :label="cat"
                    />
                    <UBadge
                        v-if="receipt.total_savings > 0"
                        variant="subtle"
                        color="success"
                        :label="`−${fmt(receipt.total_savings)} saved`"
                    />
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
