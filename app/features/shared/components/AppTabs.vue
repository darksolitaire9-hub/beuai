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
</script>

<template>
    <UTabs
        :model-value="props.modelValue"
        :items="props.items"
        variant="link"
        class="flex-1 flex flex-col"
        :ui="{
            root: 'flex flex-col flex-1',
            list: 'sticky top-[53px] z-40 bg-default border-b border-default rounded-none px-0',
            trigger: 'grow rounded-none',
            content: 'flex-1 overflow-y-auto',
        }"
        @update:model-value="(val) => emit('update:modelValue', val)"
    >
        <template #scan>
            <slot name="scan" />
        </template>

        <template #results>
            <slot name="results" />
        </template>

        <template #history>
            <slot name="history" />
        </template>
    </UTabs>
</template>
