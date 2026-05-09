<script setup lang="ts">
import type { ReceiptLanguage } from "../composables/useReceiptLanguage";

const { setLocale, locale } = useI18n();
const { set: setBusinessLang } = useReceiptLanguage();

const LANGUAGE_LABELS = {
    en: "English",
    es: "Español",
    pt: "Português",
};

const display = computed(() => LANGUAGE_LABELS[locale.value as keyof typeof LANGUAGE_LABELS] || 'English');

const items = Object.entries(LANGUAGE_LABELS).map(([code, label]) => ({
    label,
    onSelect: () => {
        setLocale(code);
        setBusinessLang(code as ReceiptLanguage);
    },
}));
</script>

<template>
    <UDropdownMenu :items="[items]">
        <UButton
            variant="ghost"
            size="sm"
            trailing-icon="i-lucide-chevron-down"
            v-bind="$attrs"
        >
            {{ display }}
        </UButton>
    </UDropdownMenu>
</template>
