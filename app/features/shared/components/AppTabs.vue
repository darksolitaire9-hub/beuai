<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

type TabValue = string | number;

const props = defineProps<{
    modelValue: TabValue;
    items: TabsItem[];
    hideNav?: boolean;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: TabValue];
}>();

function onTabClick(value: TabValue) {
    emit("update:modelValue", value);
}
</script>

<template>
    <div class="flex flex-1 w-full h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <!-- Desktop Sidebar Navigation -->
        <aside
            v-if="!hideNav"
            class="hidden md:flex flex-col w-72 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 shadow-xl z-20"
        >
            <div class="p-8">
                <div class="flex items-center gap-4 font-black text-2xl text-neutral-900 dark:text-white tracking-tighter">
                    <div class="bg-primary-500 text-white p-2.5 rounded-2xl shadow-lg shadow-primary-500/30">
                        <UIcon name="i-lucide-scan-line" class="size-7 block" />
                    </div>
                    <span>beuai</span>
                </div>
            </div>

            <nav class="flex-1 px-4 py-4 space-y-2" role="tablist" aria-label="Main Navigation">
                <button
                    v-for="item in props.items"
                    :key="item.value"
                    role="tab"
                    :aria-selected="props.modelValue === item.value"
                    :aria-controls="`tabpanel-${item.value}`"
                    :id="`tab-${item.value}`"
                    class="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-200 font-black text-sm uppercase tracking-wider group relative overflow-hidden"
                    :class="[
                        props.modelValue === item.value
                            ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white',
                    ]"
                    @click="onTabClick(item.value)"
                >
                    <UIcon :name="item.icon" class="size-5 transition-transform group-hover:scale-110" />
                    {{ item.label }}
                    
                    <div v-if="props.modelValue === item.value" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                </button>
            </nav>

            <div class="p-6 border-t border-neutral-100 dark:border-neutral-800 space-y-6">
               <AppLanguagePicker class="w-full justify-start font-bold" aria-label="Change language" />
               <UColorModeButton class="w-full justify-start font-bold" aria-label="Toggle dark mode" />
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 relative">
            <!-- Mobile Header (hidden on desktop) -->
            <header
                v-if="!hideNav"
                class="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 z-20"
            >
                <div class="flex items-center gap-3 font-black text-xl text-neutral-900 dark:text-white tracking-tighter">
                    <UIcon name="i-lucide-scan-line" class="text-primary-500 size-6" />
                    <span>beuai</span>
                </div>
                <div class="flex items-center gap-2">
                    <AppLanguagePicker aria-label="Change language" />
                    <UColorModeButton />
                </div>
            </header>

            <!-- Scrollable Page Content -->
            <div 
                class="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950"
                :class="[!hideNav ? 'pb-32 md:pb-0' : '']"
            >
                <div class="max-w-4xl mx-auto min-h-full">
                    <div 
                        v-for="item in props.items" 
                        :key="item.value"
                        :id="`tabpanel-${item.value}`"
                        role="tabpanel"
                        :aria-labelledby="`tab-${item.value}`"
                        class="min-h-full"
                        v-show="props.modelValue === item.value"
                    >
                        <slot :name="item.value" />
                    </div>
                    <!-- Handle slots not in items (e.g. results in wizard mode) -->
                    <div 
                        v-if="!props.items.some(i => i.value === props.modelValue)"
                        role="tabpanel"
                        class="min-h-full"
                    >
                        <slot v-if="props.modelValue === 'scan'" name="scan" />
                        <slot v-if="props.modelValue === 'results'" name="results" />
                        <slot v-if="props.modelValue === 'history'" name="history" />
                        <slot v-if="props.modelValue === 'analyze'" name="analyze" />
                    </div>
                </div>
            </div>

            <!-- Mobile Bottom Navigation (hidden on desktop) -->
            <nav
                v-if="!hideNav"
                class="fixed bottom-0 left-0 w-full md:hidden bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 flex justify-around items-center px-4 py-3 pb-safe z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]"
                role="tablist"
                aria-label="Mobile Navigation"
            >
                <button
                    v-for="item in props.items"
                    :key="item.value"
                    role="tab"
                    :aria-selected="props.modelValue === item.value"
                    :aria-controls="`tabpanel-${item.value}`"
                    :id="`mobile-tab-${item.value}`"
                    class="flex flex-col items-center gap-1.5 px-4 py-2 transition-all duration-300 rounded-2xl active:scale-90"
                    :class="[
                        props.modelValue === item.value
                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 shadow-sm'
                            : 'text-neutral-500 hover:text-primary-400',
                    ]"
                    @click="onTabClick(item.value)"
                >
                    <UIcon :name="item.icon" class="size-6" />
                    <span class="text-[10px] font-black uppercase tracking-widest">{{ item.label }}</span>
                </button>
            </nav>
        </main>
    </div>
</template>
