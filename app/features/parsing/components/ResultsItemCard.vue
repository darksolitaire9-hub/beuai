<script setup lang="ts">
import type { ReceiptItem } from "../types/receipt";

const props = defineProps<{
    item: ReceiptItem;
}>();

const fmt = (n: number) => `€${n.toFixed(2)}`;

const qtyLabel = computed(() => {
    const item = props.item;

    if (item.qty % 1 !== 0) {
        return `${item.qty} kg × ${fmt(item.unit_price)}/kg`;
    }

    if (item.qty > 1) {
        return `${item.qty} × ${fmt(item.unit_price)}`;
    }

    return fmt(item.unit_price);
});

const packLabel = computed(() => {
    const pack = props.item.pack;
    if (!pack) return null;

    const units =
        typeof pack.units === "number" && pack.units > 0
            ? String(pack.units)
            : null;

    const volume =
        typeof pack.volume === "string" && pack.volume.trim() !== ""
            ? pack.volume.trim()
            : null;

    const unitCost =
        typeof pack.unit_cost === "number" ? fmt(pack.unit_cost) : null;

    const left = [units, volume].filter(Boolean).join(" × ");

    if (!left && !unitCost) return null;
    if (!left) return `@ ${unitCost}`;
    if (!unitCost) return left;

    return `${left} @ ${unitCost}`;
});
</script>

<template>
    <UCard class="border border-neutral-200 dark:border-neutral-800 shadow-none" :ui="{ body: 'p-4' }">
        <div class="flex items-start gap-4">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {{ item.name }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                    <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        {{ qtyLabel }}
                    </p>
                    <span v-if="packLabel" class="text-[10px] text-neutral-300 dark:text-neutral-700">•</span>
                    <p
                        v-if="packLabel"
                        class="text-[10px] font-bold text-primary-600 dark:text-primary-400 tabular-nums uppercase"
                    >
                        {{ packLabel }}
                    </p>
                </div>
            </div>

            <div class="text-right flex-shrink-0">
                <p class="text-sm font-bold tabular-nums text-neutral-900 dark:text-white">
                    {{ fmt(item.total) }}
                </p>
                <p
                    v-if="item.discount > 0"
                    class="text-[10px] font-bold text-success-600 tabular-nums mt-0.5"
                >
                    −{{ fmt(item.discount) }}
                </p>
            </div>
        </div>
    </UCard>
</template>
