<!--
  app/components/history/HistoryReceiptDetail.vue | Component
  Shows a full SavedReceipt in a centered overlay for review and export.
  Renders store, date, totals, and all items grouped by category.
  Needs: SavedReceipt, ReceiptItem
-->

<script setup lang="ts">
import type { SavedReceipt, ReceiptItem } from "~/types/receipt";

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
                    class="bg-default rounded-xl shadow-lg max-w-lg w-[90vw] max-h-[80vh] flex flex-col"
                >
                    <header
                        class="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-default"
                    >
                        <div>
                            <h2 class="text-lg font-bold leading-tight">
                                {{ receipt.store }}
                            </h2>
                            <p class="text-xs text-muted mt-1">
                                {{ formatDate(receipt.date) }} ·
                                {{ receipt.items.length }} items
                            </p>
                            <UBadge
                                variant="subtle"
                                color="neutral"
                                :label="receipt.payment_method"
                                icon="i-lucide-credit-card"
                                class="mt-2"
                            />
                        </div>
                        <UButton
                            variant="ghost"
                            color="neutral"
                            icon="i-lucide-x"
                            aria-label="Close"
                            @click="close"
                        />
                    </header>

                    <!-- Scrollable content -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-4">
                        <!-- Items first -->
                        <div
                            v-for="(items, category) in categoryGroups"
                            :key="category"
                            class="pt-2"
                        >
                            <p
                                class="text-xs font-bold uppercase tracking-wider text-faint mb-2"
                            >
                                {{ category }}
                            </p>
                            <div class="flex flex-col gap-1.5">
                                <div
                                    v-for="item in items"
                                    :key="`${category}-${item.name}-${item.qty}-${item.total}`"
                                    class="flex items-start justify-between text-sm"
                                >
                                    <div class="flex-1 min-w-0 mr-2">
                                        <p class="truncate">{{ item.name }}</p>
                                        <p class="text-xs text-muted mt-0.5">
                                            {{ item.qty }} ×
                                            {{ fmt(item.unit_price) }}
                                            <span v-if="item.discount > 0">
                                                · −{{
                                                    fmt(item.discount)
                                                }}
                                                discount
                                            </span>
                                        </p>
                                    </div>
                                    <p
                                        class="text-sm font-semibold tabular-nums"
                                    >
                                        {{ fmt(item.total) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Totals at the bottom -->
                        <UCard :ui="{ body: 'p-0 divide-y divide-default' }">
                            <div
                                class="flex justify-between items-center px-4 py-3 text-sm"
                            >
                                <span class="text-muted">Subtotal</span>
                                <span class="font-semibold tabular-nums">
                                    {{ fmt(receipt.subtotal) }}
                                </span>
                            </div>
                            <div
                                class="flex justify-between items-center px-4 py-3 text-sm"
                            >
                                <span class="text-muted">Savings</span>
                                <span
                                    class="font-semibold tabular-nums text-success"
                                >
                                    {{
                                        receipt.total_savings > 0
                                            ? `−${fmt(receipt.total_savings)}`
                                            : fmt(0)
                                    }}
                                </span>
                            </div>
                            <div
                                class="flex justify-between items-center px-4 py-4 bg-primary/8 rounded-b-xl"
                            >
                                <span class="font-bold text-primary"
                                    >Total paid</span
                                >
                                <span
                                    class="font-bold text-lg tabular-nums text-primary"
                                >
                                    {{ fmt(receipt.total_paid) }}
                                </span>
                            </div>
                        </UCard>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
