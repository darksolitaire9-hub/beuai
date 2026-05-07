<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="visible"
                class="fixed inset-0 z-50 overflow-hidden"
                role="status"
                aria-live="polite"
            >
                <div class="scan-wave-bg absolute inset-0" />
                <div
                    class="relative z-10 flex flex-col items-center justify-center h-full gap-6"
                >
                    <UIcon
                        name="i-lucide-scan-line"
                        class="size-12 text-primary animate-pulse"
                    />
                    <div class="text-center">
                        <p class="font-semibold text-lg">Reading receipt…</p>
                        <p class="text-sm text-muted">Extracting your items…</p>
                    </div>
                    <ScanProcessingSteps />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

:root {
    --scan-wave-1: #f7f6f2;
    --scan-wave-2: color-mix(in oklch, #01696f 6%, #f7f6f2);
    --scan-wave-3: #f9f8f5;
    --scan-wave-4: color-mix(in oklch, #01696f 10%, #f9f8f5);
}

.dark,
[data-theme="dark"] {
    --scan-wave-1: #171614;
    --scan-wave-2: color-mix(in oklch, #4f98a3 10%, #171614);
    --scan-wave-3: #1c1b19;
    --scan-wave-4: color-mix(in oklch, #4f98a3 15%, #1c1b19);
}

.scan-wave-bg {
    background: linear-gradient(
        -45deg,
        var(--scan-wave-1),
        var(--scan-wave-2),
        var(--scan-wave-3),
        var(--scan-wave-4)
    );
    background-size: 400% 400%;
    animation: scan-wave 5s ease infinite;
}

@keyframes scan-wave {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .scan-wave-bg {
        animation: none;
    }
}
</style>
