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

const scrollContainer = ref<HTMLElement | null>(null);

// Ensure tab content starts at the top when switching
watch(() => props.modelValue, async () => {
    await nextTick();
    if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
    }
});

const internalModel = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val)
});
</script>

<template>
    <div class="flex flex-1 w-full h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <!-- Desktop Sidebar Navigation -->
        <AppSidebar v-if="!hideNav" v-model="internalModel" :items="props.items" />

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 relative">
            <!-- Mobile Header (hidden on desktop) -->
            <AppHeaderMobile v-if="!hideNav" />

            <!-- Scrollable Page Content -->
            <div 
                ref="scrollContainer"
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
            <AppBottomNav v-if="!hideNav" v-model="internalModel" :items="props.items" />
        </main>
    </div>
</template>
