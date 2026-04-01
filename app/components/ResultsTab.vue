<script setup lang="ts">
import type { ReceiptItem } from "~/types/receipt";

const { result, clear } = useReceiptScanner();
const { save } = useReceiptHistory();
const toast = useToast();

const categoryGroups = computed(() => {
    if (!result.value) return {};
    return result.value.items.reduce(
        (acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
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
const qtyLabel = (item: ReceiptItem) => {
    if (item.qty % 1 !== 0)
        return `${item.qty} kg × ${fmt(item.unit_price)}/kg`;
    if (item.qty > 1) return `${item.qty} × ${fmt(item.unit_price)}`;
    return fmt(item.unit_price);
};

function saveReceipt() {
    if (!result.value) return;
    save(result.value);
    clear();
    toast.add({
        title: "Receipt saved!",
        icon: "i-lucide-check-circle",
        color: "success",
    });
}

function discard() {
    clear();
    toast.add({
        title: "Discarded",
        icon: "i-lucide-trash-2",
        color: "neutral",
    });
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

    <div v-else class="flex flex-col pb-24">
        <div class="px-4 pt-5 pb-4 border-b border-default">
            <h2 class="text-xl font-bold leading-tight mb-1">
                {{ result.store }}
            </h2>
            <div class="flex gap-3 flex-wrap">
                <div class="flex items-center gap-1 text-xs text-muted">
                    <UIcon name="i-lucide-calendar" class="size-3" />{{
                        formatDate(result.date)
                    }}
                </div>
                <div class="flex items-center gap-1 text-xs text-muted">
                    <UIcon name="i-lucide-package" class="size-3" />{{
                        result.items.length
                    }}
                    items
                </div>
            </div>
        </div>

        <UAlert
            v-if="!result._meta?.trusted"
            icon="i-lucide-triangle-alert"
            color="warning"
            variant="soft"
            title="Total mismatch detected"
            description="Review prices before saving."
            class="mx-4 mt-4"
        />

        <div
            v-for="(items, category) in categoryGroups"
            :key="category"
            class="px-4 pt-4"
        >
            <p
                class="text-xs font-bold uppercase tracking-wider text-faint mb-3"
            >
                {{ category }}
            </p>
            <div class="flex flex-col gap-2">
                <UCard
                    v-for="item in items"
                    :key="item.name"
                    :ui="{ body: 'p-3' }"
                >
                    <div class="flex items-start gap-3">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">
                                {{ item.name }}
                            </p>
                            <p class="text-xs text-muted mt-0.5">
                                {{ qtyLabel(item) }}
                            </p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="text-sm font-semibold tabular-nums">
                                {{ fmt(item.total) }}
                            </p>
                            <p
                                v-if="item.discount > 0"
                                class="text-xs text-success tabular-nums"
                            >
                                −{{ fmt(item.discount) }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <UCard class="mx-4 mt-4" :ui="{ body: 'p-0 divide-y divide-default' }">
            <div class="flex justify-between items-center px-4 py-3 text-sm">
                <span class="text-muted">Subtotal</span>
                <span class="font-semibold tabular-nums">{{
                    fmt(result.subtotal)
                }}</span>
            </div>
            <div class="flex justify-between items-center px-4 py-3 text-sm">
                <span class="text-muted">Savings</span>
                <span class="font-semibold tabular-nums text-success">
                    {{
                        result.total_savings > 0
                            ? `−${fmt(result.total_savings)}`
                            : fmt(0)
                    }}
                </span>
            </div>
            <div
                class="flex justify-between items-center px-4 py-4 bg-primary/8 rounded-b-xl"
            >
                <span class="font-bold text-primary">Total paid</span>
                <span class="font-bold text-lg tabular-nums text-primary">{{
                    fmt(result.total_paid)
                }}</span>
            </div>
        </UCard>

        <div class="mx-4 mt-3">
            <UBadge
                variant="subtle"
                color="neutral"
                :label="result.payment_method"
                icon="i-lucide-credit-card"
            />
        </div>

        <div
            class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex gap-3 px-4 py-4 bg-default/90 backdrop-blur border-t border-default"
        >
            <UButton
                variant="outline"
                icon="i-lucide-trash-2"
                class="flex-1"
                @click="discard"
                >Discard</UButton
            >
            <UButton icon="i-lucide-save" class="flex-[2]" @click="saveReceipt"
                >Save to History</UButton
            >
        </div>
    </div>
</template>
