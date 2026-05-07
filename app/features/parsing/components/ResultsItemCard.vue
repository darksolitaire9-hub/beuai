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
    <UCard :ui="{ body: 'p-3' }">
        <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                    {{ item.name }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                    {{ qtyLabel }}
                </p>
                <p
                    v-if="packLabel"
                    class="text-[11px] text-faint mt-1 tabular-nums"
                >
                    {{ packLabel }}
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
</template>
