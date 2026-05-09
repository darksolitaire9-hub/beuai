<script setup lang="ts">
import type { ScanStage } from "../composables/useReceiptScanner";

const props = defineProps<{ visible: boolean }>();
const { stage } = useReceiptScanner();

const STAGES: Record<ScanStage, { id: number, labelKey: string, icon: string }> = {
    idle: { id: 0, labelKey: '', icon: '' },
    compressing: { id: 1, labelKey: 'scan.stages.compressing', icon: 'i-lucide-shield-check' },
    analyzing: { id: 2, labelKey: 'scan.stages.analyzing', icon: 'i-lucide-brain-circuit' }
};

const current = computed(() => STAGES[stage.value]);
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="visible"
                class="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl"
            >
                <div class="max-w-xs w-full p-8 text-center">
                    <!-- Rescue Spinner -->
                    <div class="relative size-32 mx-auto mb-10">
                        <div class="absolute inset-0 border-8 border-primary-100 dark:border-primary-900/30 rounded-full" />
                        <div class="absolute inset-0 border-8 border-primary-500 rounded-full border-t-transparent animate-spin" />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <UIcon
                                :name="current.icon || 'i-lucide-scan-line'"
                                class="size-12 text-primary-500 animate-pulse"
                            />
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">
                            {{ $t('app.title') }}
                        </h3>
                        
                        <Transition name="slide-up" mode="out-in">
                            <p 
                                :key="stage"
                                class="text-sm font-bold text-neutral-500 leading-relaxed min-h-[3rem]"
                            >
                                {{ $t(current.labelKey) }}
                            </p>
                        </Transition>
                    </div>

                    <!-- Stage Progress dots -->
                    <div class="flex justify-center gap-2 mt-8">
                        <div 
                            v-for="s in [1, 2]" 
                            :key="s"
                            class="size-2 rounded-full transition-all duration-500"
                            :class="[
                                current.id >= s ? 'bg-primary-500 w-6' : 'bg-neutral-200 dark:bg-neutral-800'
                            ]"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 500ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 400ms ease;
}
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
