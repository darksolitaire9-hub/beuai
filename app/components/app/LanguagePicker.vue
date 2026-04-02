<script setup lang="ts">
import {
    useReceiptLanguage,
    LANGUAGE_LABELS,
    type ReceiptLanguage,
} from "~/composables/useReceiptLanguage";

const { lang, set } = useReceiptLanguage();

const display = computed(() => LANGUAGE_LABELS[lang.value]);

const items = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({
    label,
    onSelect: () => set(value as ReceiptLanguage),
}));
</script>

<template>
    <UDropdownMenu :items="[items]">
        <UButton
            variant="ghost"
            size="sm"
            trailing-icon="i-lucide-chevron-down"
        >
            {{ display }}
        </UButton>
    </UDropdownMenu>
</template>
