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
const { t } = useI18n();

const selected = ref<SavedReceipt | null>(null);
const showDetail = ref(false);

onMounted(async () => {
    try {
        await hydrate();
    } catch {
        toast.add({
            title: t('history.alerts.load_failed'),
            description: t('history.alerts.storage_unavailable'),
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
        toast.add({ title: t('history.alerts.removed'), color: "neutral" });
    } catch {
        toast.add({ title: t('history.alerts.remove_failed'), color: "error" });
    }
}

function exportAll() {
    const success = exportToCsv(history.value);
    if (!success) {
        toast.add({ title: t('history.alerts.no_export'), color: "neutral" });
    }
}
</script>

<template>
    <div class="flex flex-col min-h-full pb-24 md:pb-12">
        <!-- Single header — always visible -->
        <div class="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('history.title') }}</h2>
                <UButton
                    v-if="history.length"
                    variant="soft"
                    color="neutral"
                    icon="i-lucide-download"
                    size="sm"
                    :label="$t('history.export')"
                    class="font-bold tracking-tight"
                    @click="exportAll"
                />
            </div>
            <div v-if="history.length" class="flex items-center gap-3">
                 <UBadge color="primary" variant="soft" class="font-black px-2.5">
                    {{ history.length }} {{ $t('history.rescued') }}
                 </UBadge>
                 <div class="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
                 <p class="text-sm font-bold text-neutral-500">
                    <span class="text-neutral-900 dark:text-white">{{ fmt(totalSpent) }}</span> {{ $t('history.total') }} ·
                    <span class="text-success-600">{{ fmt(totalSaved) }} {{ $t('history.saved') }}</span>
                 </p>
            </div>
            <p v-else class="text-sm font-bold text-neutral-400 uppercase tracking-widest">{{ $t('history.no_data') }}</p>
        </div>

        <!-- Empty state -->
        <div
            v-if="!history.length"
            class="flex-1 flex flex-col items-center justify-center gap-8 p-12 text-center"
        >
            <div class="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] shadow-xl ring-1 ring-neutral-200 dark:ring-neutral-800">
                <UIcon name="i-lucide-clock" class="size-16 text-primary-500/20" />
            </div>
            <div class="space-y-3">
                <p class="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">{{ $t('history.empty_title') }}</p>
                <p class="text-neutral-500 max-w-sm leading-relaxed font-medium">
                    {{ $t('history.empty_desc') }}
                </p>
            </div>
        </div>

        <!-- Cards list -->
        <ul v-else class="grid grid-cols-1 gap-6 p-6" role="list">
            <li
                v-for="receipt in history"
                :key="receipt.id"
            >
                <UCard
                    class="group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    :ui="{ body: 'p-0' }"
                >
                    <button 
                        class="w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20"
                        @click="openReceipt(receipt)"
                        :aria-label="`View details for ${receipt.store} on ${formatDate(receipt.date)}`"
                    >
                        <div class="flex items-start justify-between p-6">
                            <div class="flex-1 min-w-0 mr-4">
                                <p class="font-black text-xl text-neutral-900 dark:text-white truncate group-hover:text-primary-600 transition-colors tracking-tight">
                                    {{ receipt.store }}
                                </p>
                                <div class="flex items-center gap-2 mt-2">
                                     <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">
                                        {{ formatDate(receipt.date) }}
                                    </p>
                                    <div class="size-1 rounded-full bg-neutral-300" />
                                     <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">
                                        {{ receipt.items.length }} {{ $t('history.items') }}
                                    </p>
                                </div>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <p class="text-2xl font-black tabular-nums text-neutral-900 dark:text-white tracking-tighter">
                                    {{ fmt(receipt.total_paid) }}
                                </p>
                                <UButton
                                    variant="ghost"
                                    color="error"
                                    icon="i-lucide-trash-2"
                                    size="xs"
                                    class="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                    :aria-label="`Delete receipt from ${receipt.store}`"
                                    @click.stop="deleteReceipt(receipt.id)"
                                />
                            </div>
                        </div>
                        <div
                            class="flex gap-2 flex-wrap px-6 pb-5 pt-4 bg-neutral-50/50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800"
                        >
                            <UBadge
                                v-for="cat in categorySummary(receipt.items)"
                                :key="cat"
                                variant="soft"
                                color="neutral"
                                class="text-[10px] font-black"
                            >
                                {{ cat }}
                            </UBadge>
                            <UBadge
                                v-if="receipt.total_savings > 0"
                                variant="soft"
                                color="success"
                                class="text-[10px] font-black"
                            >
                                −{{ fmt(receipt.total_savings) }}
                            </UBadge>
                        </div>
                    </button>
                </UCard>
            </li>
        </ul>

        <HistoryReceiptDetail
            v-if="selected"
            :receipt="selected"
            :open="showDetail"
            @close="closeDetail"
        />
    </div>
</template>
