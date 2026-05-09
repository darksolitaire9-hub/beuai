<script setup lang="ts">
const { history, totalSpent, totalSaved } = useReceiptHistory();

const fmt = (n: number) => `€${n.toFixed(2)}`;
</script>

<template>
    <div class="flex flex-col min-h-full pb-24 md:pb-12">
        <div class="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('analyze.title') }}</h2>
            <p class="text-sm text-neutral-500 font-bold mt-1">
                {{ $t('analyze.subtitle') }}
            </p>
        </div>

        <div class="flex-1 p-6 space-y-8">
            <!-- Impact Cards -->
            <div class="grid grid-cols-2 gap-6">
                <UCard class="ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-lg">
                    <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400">{{ $t('analyze.rescued') }}</p>
                    <p class="text-4xl font-black mt-2 text-neutral-900 dark:text-white tracking-tighter">{{ history.length }}</p>
                    <p class="text-[10px] text-neutral-500 font-bold mt-1">{{ $t('analyze.total_items') }}</p>
                </UCard>
                <UCard class="ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-lg">
                    <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400">{{ $t('analyze.savings') }}</p>
                    <p class="text-4xl font-black mt-2 text-success-600 tracking-tighter">{{ fmt(totalSaved) }}</p>
                    <p class="text-[10px] text-neutral-500 font-bold mt-1">{{ $t('analyze.discounts') }}</p>
                </UCard>
            </div>

            <!-- Future Roadmap Placeholder -->
            <div class="bg-white dark:bg-neutral-900 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 p-10 text-center shadow-inner relative overflow-hidden group">
                <div class="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div class="bg-neutral-50 dark:bg-neutral-800 size-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700">
                    <UIcon name="i-lucide-sparkles" class="size-8 text-primary-500" />
                </div>
                
                <p class="font-black text-xl text-neutral-900 dark:text-white mb-2 tracking-tight">{{ $t('analyze.coming_soon_title') }}</p>
                <p class="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto font-medium">
                    {{ $t('analyze.coming_soon_desc') }}
                </p>
                
                <div class="mt-8">
                     <UBadge variant="soft" color="primary" class="font-black px-3">{{ $t('analyze.beta_access') }}</UBadge>
                </div>
            </div>
        </div>
    </div>
</template>
