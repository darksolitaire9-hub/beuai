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
                    class="bg-white dark:bg-neutral-900 md:rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800"
                >
                    <header
                        class="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800"
                    >
                        <div>
                            <h2 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                {{ receipt.store }}
                            </h2>
                            <div class="flex items-center gap-3 mt-1">
                                <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                    {{ formatDate(receipt.date) }}
                                </p>
                                <span class="text-neutral-300 dark:text-neutral-700">•</span>
                                <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                    {{ receipt.items.length }} items
                                </p>
                            </div>
                        </div>
                        <UButton
                            variant="ghost"
                            color="neutral"
                            icon="i-lucide-x"
                            class="-mr-2"
                            aria-label="Close"
                            @click="close"
                        />
                    </header>

                    <!-- Scrollable content -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-6">
                        <!-- Items grouped -->
                        <div
                            v-for="(items, category) in categoryGroups"
                            :key="category"
                        >
                            <p
                                class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3"
                            >
                                {{ category }}
                            </p>
                            <div class="flex flex-col gap-3">
                                <div
                                    v-for="item in items"
                                    :key="`${category}-${item.name}-${item.qty}-${item.total}`"
                                    class="flex items-start justify-between text-sm"
                                >
                                    <div class="flex-1 min-w-0 mr-4">
                                        <p class="font-bold text-neutral-900 dark:text-white leading-snug">{{ item.name }}</p>
                                        <p class="text-xs text-neutral-500 mt-0.5">
                                            {{ item.qty }} × {{ fmt(item.unit_price) }}
                                            <span v-if="item.discount > 0" class="text-success-600 ml-1 font-medium">
                                                (−{{ fmt(item.discount) }})
                                            </span>
                                        </p>
                                    </div>
                                    <p
                                        class="font-bold tabular-nums text-neutral-900 dark:text-white"
                                    >
                                        {{ fmt(item.total) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Totals Section -->
                        <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-neutral-500">Subtotal</span>
                                <span class="font-medium text-neutral-900 dark:text-white tabular-nums">
                                    {{ fmt(receipt.subtotal) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-neutral-500">Total Savings</span>
                                <span class="font-bold text-success-600 tabular-nums">
                                    {{ receipt.total_savings > 0 ? `−${fmt(receipt.total_savings)}` : fmt(0) }}
                                </span>
                            </div>
                            <div class="flex justify-between items-center pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                                <span class="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">Total Paid</span>
                                <span class="font-bold text-2xl tabular-nums text-primary-600 dark:text-primary-400">
                                    {{ fmt(receipt.total_paid) }}
                                </span>
                            </div>
                        </div>

                        <div class="pt-4 flex items-center justify-between">
                             <UBadge
                                variant="subtle"
                                color="neutral"
                                class="text-[10px] font-bold"
                                icon="i-lucide-credit-card"
                             >
                                {{ receipt.payment_method }}
                             </UBadge>
                             <p class="text-[10px] text-neutral-400 uppercase tracking-tighter">ID: {{ receipt.id.slice(0,8) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
