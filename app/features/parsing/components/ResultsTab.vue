<!--
  app/components/results/ResultsTab.vue | Component — orchestration only
  Displays a parsed receipt for review and lets the user save or discard it.
  Delegates persistence to useReceiptHistory, scanner state to useReceiptScanner.
  Needs: useReceiptScanner, useReceiptHistory, ResultsItemCard, setTab (inject)
-->

<script setup lang="ts">
import type { ReceiptItem } from "../types/receipt";

const { result, clear } = useReceiptScanner();
const { save } = useReceiptHistory();
const toast = useToast();
const _setTab = inject<(tab: string) => void>("setTab");
if (!_setTab) throw new Error("setTab injection is missing");
const setTab = _setTab;

const categoryGroups = computed(() => {
    if (!result.value) return {} as Record<string, ReceiptItem[]>;

    return result.value.items.reduce(
        (acc, item) => {
            const category = item.category;
            const group = acc[category] ?? (acc[category] = []);
            group.push(item);
            return acc;
        },
        {} as Record<string, ReceiptItem[]>,
    );
});

const fmt = (n: number) => `€${n.toFixed(2)}`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

async function saveReceipt() {
    if (!result.value) return;
    try {
        await save(result.value);
        clear();
        toast.add({
            title: "Receipt saved!",
            icon: "i-lucide-check-circle",
            color: "success",
        });
        setTab("history");
    } catch {
        toast.add({
            title: "Could not save receipt",
            description: "Storage may be full or unavailable.",
            color: "error",
        });
    }
}

function discard() {
    clear();

    toast.add({
        title: "Discarded",
        icon: "i-lucide-trash-2",
        color: "neutral",
    });

    setTab("scan");
}
</script>

<template>
    <div
        v-if="!result"
        class="flex flex-col items-center justify-center gap-4 p-12 text-center text-muted"
    >
        <UIcon name="i-lucide-receipt" class="size-10 text-faint" />
        <p class="text-sm">Scan a receipt to see results here.</p>
    </div>

    <div v-else class="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
        <div class="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                {{ result.store }}
            </h2>
            <div class="flex gap-3 flex-wrap">
                <div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <UIcon name="i-lucide-calendar" class="size-3.5" />{{
                        formatDate(result.date)
                    }}
                </div>
                <div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <UIcon name="i-lucide-package" class="size-3.5" />{{
                        result.items.length
                    }}
                    items
                </div>
                <UBadge
                    variant="subtle"
                    color="neutral"
                    class="text-[10px] font-bold"
                    icon="i-lucide-credit-card"
                >
                    {{ result.payment_method }}
                </UBadge>
            </div>
        </div>

        <div class="p-6 space-y-6">
            <UAlert
                v-if="!result._meta?.trusted"
                icon="i-lucide-triangle-alert"
                color="warning"
                variant="soft"
                title="Verify Accuracy"
                description="We detected a price mismatch. Please check the line items."
            />

            <div
                v-for="(items, category) in categoryGroups"
                :key="category"
                class="space-y-3"
            >
                <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">
                    {{ category }}
                </p>
                <div class="grid grid-cols-1 gap-2">
                    <ResultsItemCard
                        v-for="(item, index) in items"
                        :key="`${category}-${item.name}-${index}`"
                        :item="item"
                    />
                </div>
            </div>

            <!-- Totals Card -->
            <UCard class="ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-none overflow-hidden" :ui="{ body: 'p-0 divide-y divide-neutral-100 dark:divide-neutral-800' }">
                <div class="flex justify-between items-center px-5 py-3.5 text-sm">
                    <span class="text-neutral-500">Subtotal</span>
                    <span class="font-medium text-neutral-900 dark:text-white tabular-nums">{{ fmt(result.subtotal) }}</span>
                </div>
                <div class="flex justify-between items-center px-5 py-3.5 text-sm">
                    <span class="text-neutral-500">Savings</span>
                    <span class="font-medium text-success-600 tabular-nums">{{ result.total_savings > 0 ? `−${fmt(result.total_savings)}` : fmt(0) }}</span>
                </div>
                <div class="flex justify-between items-center px-5 py-4 bg-neutral-50 dark:bg-neutral-800/50">
                    <span class="font-bold text-neutral-900 dark:text-white">Total Paid</span>
                    <span class="font-bold text-xl text-primary-600 dark:text-primary-400 tabular-nums">{{ fmt(result.total_paid) }}</span>
                </div>
            </UCard>
        </div>

        <!-- Sticky Actions (Mobile) / Side Actions (Desktop) -->
        <div class="md:sticky md:bottom-0 p-6 pt-0 bg-neutral-50 dark:bg-neutral-950">
             <div class="flex gap-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
                <UButton
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-trash-2"
                    class="flex-1"
                    label="Discard"
                    @click="discard"
                />
                <UButton 
                    icon="i-lucide-save" 
                    class="flex-1" 
                    label="Save to History"
                    @click="saveReceipt"
                />
             </div>
        </div>
    </div>
</template>
