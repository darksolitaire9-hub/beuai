<script setup lang="ts">
const { history, totalSpent, totalSaved } = useReceiptHistory();

const fmt = (n: number) => `€${n.toFixed(2)}`;
</script>

<template>
    <div class="flex flex-col min-h-full">
        <div class="px-6 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <h2 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Intelligence</h2>
            <p class="text-sm text-neutral-500 font-medium mt-1">
                Advanced patterns and spending analysis.
            </p>
        </div>

        <div class="flex-1 p-6 space-y-6">
            <!-- Impact Cards -->
            <div class="grid grid-cols-2 gap-4">
                <UCard class="border-neutral-200 dark:border-neutral-800 shadow-none">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Items Rescued</p>
                    <p class="text-3xl font-bold mt-1 text-neutral-900 dark:text-white">{{ history.length }}</p>
                    <p class="text-[10px] text-neutral-500 font-medium mt-1">From total receipts</p>
                </UCard>
                <UCard class="border-neutral-200 dark:border-neutral-800 shadow-none">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Savings</p>
                    <p class="text-3xl font-bold mt-1 text-success-600">{{ fmt(totalSaved) }}</p>
                    <p class="text-[10px] text-neutral-500 font-medium mt-1">Captured discounts</p>
                </UCard>
            </div>

            <!-- Future Roadmap Placeholder -->
            <div class="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
                <UIcon name="i-lucide-bar-chart-horizontal-big" class="size-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                <p class="font-bold text-neutral-900 dark:text-white mb-1">Coming Soon: Deep Patterns</p>
                <p class="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
                    We're building automated price comparisons and category-level spending trends to help you optimize every purchase.
                </p>
            </div>
        </div>
    </div>
</template>
