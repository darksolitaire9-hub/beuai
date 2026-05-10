<!--
  app/components/history/HistoryReceiptDetail.vue | Component
  Shows a full SavedReceipt in a centered overlay for review and export.
  Renders store, date, totals, and all items grouped by category.
  Needs: SavedReceipt, ReceiptItem
-->

<script setup lang="ts">
import type { SavedReceipt } from "../types/receipt";
import type { ReceiptItem } from "../../parsing/types/receipt";

const props = defineProps<{
    receipt: SavedReceipt;
    open: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();

const fmt = (n: number) => `€${n.toFixed(2)}`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const categoryGroups = computed(() => {
    const acc: Record<string, ReceiptItem[]> = {};
    for (const item of props.receipt.items) {
        const category = item.category;
        const group = acc[category] ?? (acc[category] = []);
        group.push(item);
    }
    return acc;
});

function close() {
    emit("close");
}
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                @click.self="close"
            >
                <div
                    class="bg-white dark:bg-neutral-900 md:rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800"
                >
                    <header
                        class="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-neutral-800"
                    >
                        <div class="min-w-0">
                            <h2 class="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white truncate">
                                {{ receipt.store }}
                            </h2>
                            <div class="flex items-center gap-3 mt-2 flex-wrap">
                                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] whitespace-nowrap">
                                    {{ formatDate(receipt.date) }}
                                </p>
                                <div class="size-1 rounded-full bg-neutral-300 flex-shrink-0" />
                                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] whitespace-nowrap">
                                    {{ receipt.items.length }} {{ $t('results.items') }}
                                </p>
                            </div>
                        </div>
                        <UButton
                            variant="soft"
                            color="neutral"
                            icon="i-lucide-x"
                            size="sm"
                            class="rounded-full"
                            aria-label="Close"
                            @click="close"
                        />
                    </header>

                    <!-- Scrollable content -->
                    <div class="flex-1 overflow-y-auto p-8 space-y-8">
                        <!-- Items grouped -->
                        <div
                            v-for="(items, category) in categoryGroups"
                            :key="category"
                        >
                            <div class="flex items-center gap-3 mb-4">
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                    {{ category }}
                                </p>
                                <div class="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                            </div>
                            <ul class="flex flex-col gap-4" role="list">
                                <li
                                    v-for="item in items"
                                    :key="`${category}-${item.name}-${item.qty}-${item.total}`"
                                    class="flex items-start justify-between text-sm"
                                >
                                    <div class="flex-1 min-w-0 mr-4">
                                        <p class="font-bold text-neutral-900 dark:text-white leading-snug">{{ item.name }}</p>
                                        <p class="text-[11px] text-neutral-500 font-bold mt-1">
                                            {{ item.qty }} × {{ fmt(item.unit_price) }}
                                            <span v-if="item.discount > 0" class="text-success-600 ml-1">
                                                (−{{ fmt(item.discount) }})
                                            </span>
                                        </p>
                                    </div>
                                    <p
                                        class="font-black tabular-nums text-neutral-900 dark:text-white"
                                    >
                                        {{ fmt(item.total) }}
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <!-- Totals Section -->
                        <div class="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                            <div class="flex justify-between items-center text-sm font-bold">
                                <span class="text-neutral-500">{{ $t('results.subtotal') }}</span>
                                <span class="text-neutral-900 dark:text-white tabular-nums">
                                    {{ fmt(receipt.subtotal) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-sm font-bold">
                                <span class="text-neutral-500">{{ $t('results.tax_total') }}</span>
                                <span class="text-neutral-900 dark:text-white tabular-nums">
                                    {{ fmt(receipt.tax_total) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-sm font-bold">
                                <span class="text-neutral-500">{{ $t('results.total_savings') }}</span>
                                <span class="text-success-600 tabular-nums">
                                    {{ receipt.total_savings > 0 ? `−${fmt(receipt.total_savings)}` : fmt(0) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center px-6 py-6 rounded-2xl bg-primary-50/50 dark:bg-primary-950/20 mt-4">
                                <span class="font-black text-neutral-900 dark:text-white uppercase tracking-tight">{{ $t('results.total_paid') }}</span>
                                <span class="font-black text-3xl tabular-nums text-primary-600 dark:text-primary-400 tracking-tighter">
                                    {{ fmt(receipt.total_paid) }}
                                </span>
                            </div>
                        </div>

                        <div class="pt-4 flex items-center justify-between">
                             <UBadge
                                variant="soft"
                                color="neutral"
                                class="text-[10px] font-black"
                                icon="i-lucide-credit-card"
                             >
                                {{ receipt.payment_method }}
                             </UBadge>
                             <p class="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">ID: {{ receipt.id.slice(0,8) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
