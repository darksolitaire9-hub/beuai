<script setup lang="ts">
const props = defineProps<{
    mode: "idle" | "live" | "captured";
    showQualityWarning: boolean;
}>();
</script>

<template>
    <div
        class="relative rounded-2xl overflow-hidden bg-elevated aspect-[3/4] w-full flex items-center justify-center"
        :class="
            props.mode === 'captured'
                ? 'ring-2 ring-primary'
                : 'ring-1 ring-dashed ring-default'
        "
    >
        <!-- Video / preview slot -->
        <slot />

        <!-- Idle state -->
        <div
            v-if="props.mode === 'idle'"
            class="flex flex-col items-center gap-3 p-6 text-center"
        >
            <UIcon name="i-lucide-camera" class="size-10 text-muted" />
            <p class="text-sm text-muted max-w-[22ch]">
                Point camera at your receipt
            </p>
        </div>

        <!-- Corner guides -->
        <template v-if="props.mode === 'live'">
            <div
                class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl opacity-70"
            />
            <div
                class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr opacity-70"
            />
            <div
                class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl opacity-70"
            />
            <div
                class="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br opacity-70"
            />
        </template>

        <!-- Quality warning -->
        <Transition name="fade">
            <UAlert
                v-if="props.showQualityWarning"
                icon="i-lucide-sun"
                color="warning"
                variant="soft"
                title="Too dark — try better lighting"
                class="absolute bottom-3 left-3 right-3 text-xs"
            />
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
