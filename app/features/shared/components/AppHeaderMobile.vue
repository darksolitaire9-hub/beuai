<script setup lang="ts">
</script>

<template>
    <header class="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 z-20">
        <div class="flex items-center gap-3 font-black text-xl text-neutral-900 dark:text-white tracking-tighter">
            <UIcon name="i-lucide-scan-line" class="text-primary-500 size-6" />
            <span>{{ $t('app.title') }}</span>
        </div>
        <div class="flex items-center gap-2">
            <AppLanguagePicker :aria-label="$t('app.aria.change_language')" />
            <UColorModeButton />
        </div>
    </header>
</template>
