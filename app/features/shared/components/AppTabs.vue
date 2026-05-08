<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

type TabValue = string | number;

const props = defineProps<{
    modelValue: TabValue;
    items: TabsItem[];
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
            class="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        >
            <div class="p-6">
                <div class="flex items-center gap-3 font-bold text-xl text-neutral-900 dark:text-white">
                    <div class="bg-primary-500 text-white p-2 rounded-lg shadow-sm">
                        <UIcon name="i-lucide-scan-line" class="size-6 block" />
                    </div>
                    <span>beuai</span>
                </div>
            </div>

            <nav class="flex-1 px-4 py-2 space-y-1">
                <button
                    v-for="item in props.items"
                    :key="item.value"
                    class="flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-colors font-medium text-sm"
                    :class="[
                        props.modelValue === item.value
                            ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    ]"
                    @click="onTabClick(item.value)"
                >
                    <UIcon :name="item.icon" class="size-5" />
                    {{ item.label }}
                </button>
            </nav>

            <div class="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
               <AppLanguagePicker class="w-full justify-start" />
               <UColorModeButton class="w-full justify-start" />
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 relative">
            <!-- Mobile Header (hidden on desktop) -->
            <header
                class="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
            >
                <div class="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                    <UIcon name="i-lucide-scan-line" class="text-primary-500 size-5" />
                    <span>beuai</span>
                </div>
                <div class="flex items-center gap-1">
                    <AppLanguagePicker />
                    <UColorModeButton />
                </div>
            </header>

            <!-- Scrollable Page Content -->
            <div class="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div class="max-w-4xl mx-auto h-full">
                    <slot v-if="props.modelValue === 'scan'" name="scan" />
                    <slot v-if="props.modelValue === 'results'" name="results" />
                    <slot v-if="props.modelValue === 'history'" name="history" />
                    <slot v-if="props.modelValue === 'analyze'" name="analyze" />
                </div>
            </div>

            <!-- Mobile Bottom Navigation (hidden on desktop) -->
            <nav
                class="fixed bottom-0 left-0 w-full md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex justify-around items-center px-2 py-1.5 z-50"
            >
                <button
                    v-for="item in props.items"
                    :key="item.value"
                    class="flex flex-col items-center gap-1 px-3 py-1 transition-all rounded-lg"
                    :class="[
                        props.modelValue === item.value
                            ? 'text-primary-500'
                            : 'text-neutral-500 hover:text-primary-400',
                    ]"
                    @click="onTabClick(item.value)"
                >
                    <UIcon :name="item.icon" class="size-6" />
                    <span class="text-[10px] font-bold">{{ item.label }}</span>
                </button>
            </nav>
        </main>
    </div>
</template>
