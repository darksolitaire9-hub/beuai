<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const props = defineProps<{
    modelValue: string | number;
    items: TabsItem[];
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string | number];
}>();

function onTabClick(value: string | number) {
    emit("update:modelValue", value);
}
</script>

<template>
    <aside class="hidden md:flex flex-col w-72 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 shadow-xl z-20">
        <div class="p-8">
            <div class="flex items-center gap-4 font-black text-2xl text-neutral-900 dark:text-white tracking-tighter">
                <div class="bg-primary-500 text-white p-2.5 rounded-2xl shadow-lg shadow-primary-500/30">
                    <UIcon name="i-lucide-scan-line" class="size-7 block" />
                </div>
                <span>{{ $t('app.title') }}</span>
            </div>
        </div>

        <nav class="flex-1 px-4 py-4 space-y-2" role="tablist" :aria-label="$t('app.aria.main_navigation')">
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
                {{ $t(`app.tabs.${item.value}`) }}
                
                <div v-if="props.modelValue === item.value" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
            </button>
        </nav>

        <div class="p-6 border-t border-neutral-100 dark:border-neutral-800 space-y-6">
            <AppLanguagePicker class="w-full justify-start font-bold" />
            <UColorModeButton class="w-full justify-start font-bold" />
        </div>
    </aside>
</template>
