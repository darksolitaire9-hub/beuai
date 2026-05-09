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

    <div v-else class="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 pb-32 md:pb-0">
        <div class="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-20">
            <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-4">
                <UIcon name="i-lucide-shield-check" class="size-4" />
                Review & Confirm
            </div>
            <h2 class="text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-2">
                {{ result.store }}
            </h2>
            <div class="flex gap-3 flex-wrap">
                <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                    <UIcon name="i-lucide-calendar" class="size-3.5" />{{
                        formatDate(result.date)
                    }}
                </div>
                <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
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

        <div class="p-6 space-y-8">
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
                class="space-y-4"
            >
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
                    {{ category }}
                </p>
                <ul class="grid grid-cols-1 gap-2" role="list">
                    <li
                        v-for="(item, index) in items"
                        :key="`${category}-${item.name}-${index}`"
                    >
                        <ResultsItemCard :item="item" />
                    </li>
                </ul>
            </div>

            <!-- Totals Card -->
            <UCard class="ring-2 ring-neutral-200 dark:ring-neutral-800 shadow-xl overflow-hidden" :ui="{ body: 'p-0 divide-y divide-neutral-100 dark:divide-neutral-800' }">
                <div class="flex justify-between items-center px-5 py-4 text-sm font-medium">
                    <span class="text-neutral-500">Subtotal</span>
                    <span class="text-neutral-900 dark:text-white tabular-nums font-bold">{{ fmt(result.subtotal) }}</span>
                </div>
                <div class="flex justify-between items-center px-5 py-4 text-sm font-medium">
                    <span class="text-neutral-500">Savings</span>
                    <span class="text-success-600 tabular-nums font-bold">{{ result.total_savings > 0 ? `−${fmt(result.total_savings)}` : fmt(0) }}</span>
                </div>
                <div class="flex justify-between items-center px-5 py-6 bg-neutral-100/50 dark:bg-neutral-800/50">
                    <span class="font-black text-lg text-neutral-900 dark:text-white uppercase tracking-tight">Total Paid</span>
                    <span class="font-black text-3xl text-primary-600 dark:text-primary-400 tabular-nums">{{ fmt(result.total_paid) }}</span>
                </div>
            </UCard>
        </div>

        <!-- Wizard Sticky Actions -->
        <div class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-neutral-50/90 dark:from-neutral-950/90 to-transparent z-30">
             <div class="max-w-4xl mx-auto flex gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 shadow-2xl">
                <UButton
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-trash-2"
                    size="xl"
                    class="flex-1 justify-center font-bold"
                    label="Discard"
                    @click="discard"
                />
                <UButton 
                    icon="i-lucide-save" 
                    size="xl"
                    class="flex-[2] justify-center font-bold" 
                    label="Save to History"
                    @click="saveReceipt"
                />
             </div>
        </div>
    </div>
</template>
