<script setup lang="ts">
const props = defineProps<{ visible: boolean }>();
const { step } = useReceiptScanner();

const steps = [
    { id: 1, label: "Preparing Rescue", icon: "i-lucide-package-open" },
    { id: 2, label: "Extracting Data", icon: "i-lucide-zap" },
    { id: 3, label: "AI Analysis", icon: "i-lucide-brain-circuit" },
    { id: 4, label: "Rescue Complete", icon: "i-lucide-check-circle" },
];
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="visible"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md"
            >
                <div class="max-w-xs w-full p-8 text-center">
                    <!-- Rescue Spinner -->
                    <div class="relative size-32 mx-auto mb-10">
                        <div class="absolute inset-0 border-8 border-primary-100 dark:border-primary-900/30 rounded-full" />
                        <div class="absolute inset-0 border-8 border-primary-500 rounded-full border-t-transparent animate-spin" />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <UIcon
                                :name="steps.find(s => s.id === step)?.icon || 'i-lucide-search'"
                                class="size-12 text-primary-500 animate-pulse"
                            />
                        </div>
                    </div>

                    <h3 class="text-2xl font-extrabold text-primary-900 dark:text-primary-100 mb-2">
                        Rescuing Data...
                    </h3>
                    
                    <div class="flex flex-col gap-4 mt-8">
                        <div
                            v-for="s in steps"
                            :key="s.id"
                            class="flex items-center gap-3 transition-all duration-300"
                            :class="[
                                step === s.id
                                    ? 'text-primary-600 dark:text-primary-400 scale-105 font-bold'
                                    : step > s.id
                                        ? 'text-success-500 opacity-60'
                                        : 'text-muted opacity-30',
                            ]"
                        >
                            <UIcon
                                :name="step > s.id ? 'i-lucide-check-circle-2' : s.icon"
                                class="size-5"
                            />
                            <span class="text-sm tracking-wide font-bold">{{ s.label }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 300ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
