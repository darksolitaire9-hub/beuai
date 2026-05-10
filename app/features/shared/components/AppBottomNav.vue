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
    <nav
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
            <span class="text-[10px] font-black uppercase tracking-widest">{{ $t(`app.tabs.${item.value}`) }}</span>
        </button>
    </nav>
</template>
