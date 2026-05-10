<script setup lang="ts">
const { history } = useReceiptHistory();
const { totalSpent, totalSavings, categoryBreakdown, topStores } = useReceiptAnalytics();

const fmt = (n: number) => `€${(n || 0).toFixed(2)}`;

const maxCategoryValue = computed(() => Math.max(...categoryBreakdown.value.map(c => c.value), 0));
const maxStoreValue = computed(() => Math.max(...topStores.value.map(s => s.value), 0));
</script>

<template>
    <div class="flex flex-col min-h-full pb-24 md:pb-12 bg-neutral-50 dark:bg-neutral-950">
        <!-- Header -->
        <div class="px-6 py-10 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <h2 class="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('analyze.title') }}</h2>
            <p class="text-sm text-neutral-500 font-bold mt-1 uppercase tracking-widest opacity-70">
                {{ $t('analyze.subtitle') }}
            </p>
        </div>

        <div v-if="history.length > 0" class="flex-1 p-6 space-y-10 max-w-4xl mx-auto w-full">
            <!-- Impact Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <UCard class="bg-white dark:bg-neutral-900 border-none shadow-xl rounded-[2.5rem]">
                    <div class="p-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{{ $t('analyze.rescued') }}</p>
                        <p class="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">{{ history.length }}</p>
                        <p class="text-[10px] text-neutral-500 font-bold mt-1">{{ $t('analyze.total_items') }}</p>
                    </div>
                </UCard>
                <UCard class="bg-white dark:bg-neutral-900 border-none shadow-xl rounded-[2.5rem]">
                    <div class="p-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{{ $t('results.total_paid') }}</p>
                        <p class="text-4xl font-black text-primary-600 tracking-tighter">{{ fmt(totalSpent) }}</p>
                        <p class="text-[10px] text-neutral-500 font-bold mt-1">LIFETIME SPEND</p>
                    </div>
                </UCard>
                <UCard class="bg-white dark:bg-neutral-900 border-none shadow-xl rounded-[2.5rem]">
                    <div class="p-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{{ $t('analyze.savings') }}</p>
                        <p class="text-4xl font-black text-emerald-500 tracking-tighter">{{ fmt(totalSavings) }}</p>
                        <p class="text-[10px] text-neutral-500 font-bold mt-1">{{ $t('analyze.discounts') }}</p>
                    </div>
                </UCard>
            </div>

            <!-- Visualizations Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <!-- Spending by Category -->
                <div class="space-y-6">
                    <div class="flex items-center gap-3 px-2">
                        <div class="bg-primary-500 text-white p-2 rounded-xl">
                            <UIcon name="i-lucide-pie-chart" class="size-5" />
                        </div>
                        <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">Category Breakdown</h3>
                    </div>
                    
                    <div class="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-6">
                        <div v-for="cat in categoryBreakdown" :key="cat.name" class="space-y-2">
                            <div class="flex justify-between items-center text-xs font-bold">
                                <span class="text-neutral-900 dark:text-white uppercase tracking-tight">{{ $t('categories.' + cat.name) }}</span>
                                <span class="text-neutral-500">{{ fmt(cat.value) }}</span>
                            </div>
                            <div class="h-3 bg-neutral-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                    class="h-full bg-primary-500 rounded-full transition-all duration-1000"
                                    :style="{ width: `${(cat.value / maxCategoryValue) * 100}%` }"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Stores -->
                <div class="space-y-6">
                    <div class="flex items-center gap-3 px-2">
                        <div class="bg-primary-500 text-white p-2 rounded-xl">
                            <UIcon name="i-lucide-store" class="size-5" />
                        </div>
                        <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">Top Destinations</h3>
                    </div>
                    
                    <div class="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm border border-neutral-100 dark:border-neutral-800 space-y-6">
                        <div v-for="store in topStores" :key="store.name" class="space-y-2">
                            <div class="flex justify-between items-center text-xs font-bold">
                                <span class="text-neutral-900 dark:text-white truncate max-w-[150px]">{{ store.name }}</span>
                                <span class="text-neutral-500">{{ fmt(store.value) }}</span>
                            </div>
                            <div class="h-3 bg-neutral-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                    class="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                    :style="{ width: `${(store.value / maxStoreValue) * 100}%` }"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Future Patterns -->
            <div class="bg-primary-500 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                <div class="absolute right-0 top-0 opacity-10 scale-150 pointer-events-none">
                    <UIcon name="i-lucide-sparkles" class="size-64" />
                </div>
                <div class="relative z-10">
                    <h4 class="text-2xl font-black tracking-tight mb-2">{{ $t('analyze.coming_soon_title') }}</h4>
                    <p class="text-sm font-bold opacity-80 max-w-md leading-relaxed">
                        {{ $t('analyze.coming_soon_desc') }}
                    </p>
                    <div class="mt-8">
                        <UButton color="white" variant="solid" class="rounded-full px-8 font-black text-primary-600 text-xs tracking-widest uppercase">
                            {{ $t('analyze.beta_access') }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div class="bg-neutral-100 dark:bg-neutral-900 p-8 rounded-[3rem] mb-8 shadow-inner ring-1 ring-neutral-200 dark:ring-neutral-800">
                <UIcon name="i-lucide-bar-chart-3" class="size-16 text-neutral-400" />
            </div>
            <h3 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter mb-2">No Intelligence Yet</h3>
            <p class="text-sm font-bold text-neutral-500 max-w-xs leading-relaxed mb-10">
                Rescue your first receipts to see advanced patterns and spending analysis.
            </p>
        </div>
    </div>
</template>
