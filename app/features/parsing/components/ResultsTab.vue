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
const { t } = useI18n();
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
            title: t('results.alerts.saved'),
            icon: "i-lucide-check-circle",
            color: "success",
        });
        setTab("history");
    } catch {
        toast.add({
            title: t('results.alerts.save_failed'),
            description: t('results.alerts.storage_full'),
            color: "error",
        });
    }
}

function discard() {
    clear();

    toast.add({
        title: t('results.alerts.discarded'),
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

    <div v-else class="flex flex-col min-h-full bg-neutral-50 dark:bg-neutral-950 pb-40 md:pb-12">
        <div class="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
            <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <UIcon name="i-lucide-shield-check" class="size-4" />
                {{ $t('results.title') }}
            </div>
            <h2 class="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white mb-3">
                {{ result.store }}
            </h2>
            <div class="flex gap-4 flex-wrap">
                <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                    <UIcon name="i-lucide-calendar" class="size-4" />{{
                        formatDate(result.date)
                    }}
                </div>
                <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                    <UIcon name="i-lucide-package" class="size-4" />{{
                        result.items.length
                    }}
                    {{ $t('results.items') }}
                </div>
                <UBadge
                    variant="soft"
                    color="neutral"
                    class="text-[10px] font-black"
                    icon="i-lucide-credit-card"
                >
                    {{ result.payment_method }}
                </UBadge>
            </div>
        </div>

        <div class="p-6 space-y-10">
            <UAlert
                v-if="!result._meta?.trusted"
                icon="i-lucide-triangle-alert"
                color="warning"
                variant="soft"
                :title="$t('results.warnings.mismatch')"
                :description="$t('results.warnings.mismatch_desc')"
            />

            <div
                v-for="(items, category) in categoryGroups"
                :key="category"
                class="space-y-4"
            >
                <div class="flex items-center gap-3 ml-1">
                    <p class="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400">
                        {{ category }}
                    </p>
                    <div class="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <ul class="grid grid-cols-1 gap-3" role="list">
                    <li
                        v-for="(item, index) in items"
                        :key="`${category}-${item.name}-${index}`"
                    >
                        <ResultsItemCard :item="item" />
                    </li>
                </ul>
            </div>

            <!-- Totals Section (Enclosure principle) -->
            <div class="space-y-4">
                <p class="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 ml-1">
                    {{ $t('results.summary') }}
                </p>
                <UCard class="shadow-xl ring-2 ring-primary-500/10 dark:ring-primary-400/10" :ui="{ body: 'p-0 divide-y divide-neutral-100 dark:divide-neutral-800' }">
                    <div class="flex justify-between items-center px-6 py-4.5 text-sm font-bold">
                        <span class="text-neutral-500">{{ $t('results.subtotal') }}</span>
                        <span class="text-neutral-900 dark:text-white tabular-nums">{{ fmt(result.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between items-center px-6 py-4.5 text-sm font-bold">
                        <span class="text-neutral-500">{{ $t('results.savings') }}</span>
                        <span class="text-success-600 tabular-nums">{{ result.total_savings > 0 ? `−${fmt(result.total_savings)}` : fmt(0) }}</span>
                    </div>
                    <div class="flex justify-between items-center px-6 py-8 bg-primary-50/30 dark:bg-primary-950/20">
                        <span class="font-black text-xl text-neutral-900 dark:text-white uppercase tracking-tight">{{ $t('results.total_paid') }}</span>
                        <span class="font-black text-4xl text-primary-600 dark:text-primary-400 tabular-nums tracking-tighter">{{ fmt(result.total_paid) }}</span>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Wizard Sticky Actions (Thumb Zone & Safe Area) -->
        <div class="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-neutral-50/95 dark:from-neutral-950/95 to-transparent z-30">
             <div class="max-w-2xl mx-auto flex flex-wrap gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800">
                <UButton
                    variant="soft"
                    color="neutral"
                    icon="i-lucide-trash-2"
                    size="xl"
                    class="flex-1 min-w-[120px] justify-center font-black uppercase tracking-wider text-xs h-14"
                    :label="$t('results.actions.discard')"
                    @click="discard"
                />
                <UButton 
                    icon="i-lucide-save" 
                    size="xl"
                    class="flex-[2] min-w-[200px] justify-center font-black uppercase tracking-wider text-xs h-14 shadow-lg shadow-primary-500/20" 
                    :label="$t('results.actions.save')"
                    @click="saveReceipt"
                />
             </div>
        </div>
    </div>
</template>
