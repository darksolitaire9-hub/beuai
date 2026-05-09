<script setup lang="ts">
defineProps<{
    mode: "idle" | "live" | "captured";
    loading: boolean;
}>();

defineEmits<{
    open: [];
    cancel: [];
    capture: [];
    retake: [];
    confirm: [];
}>();
</script>

<template>
    <!-- Live controls -->
    <div v-if="mode === 'live'" class="flex gap-4">
        <UButton 
            variant="soft" 
            color="neutral" 
            icon="i-lucide-x" 
            size="xl" 
            class="flex-1 justify-center font-black uppercase tracking-wider text-xs h-14"
            @click="$emit('cancel')"
        >
            {{ $t('scan.controls.cancel') }}
        </UButton>
        <UButton
            class="flex-[2] justify-center font-black uppercase tracking-wider text-xs h-14 shadow-lg shadow-primary-500/20"
            icon="i-lucide-aperture"
            size="xl"
            @click="$emit('capture')"
        >
            {{ $t('scan.controls.capture') }}
        </UButton>
    </div>

    <!-- Captured controls -->
    <div v-else-if="mode === 'captured'" class="flex gap-4">
        <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-rotate-ccw"
            size="xl"
            class="flex-1 justify-center font-black uppercase tracking-wider text-xs h-14"
            @click="$emit('retake')"
        >
            {{ $t('scan.controls.retake') }}
        </UButton>
        <UButton
            class="flex-[2] justify-center font-black uppercase tracking-wider text-xs h-14 shadow-lg shadow-primary-500/20"
            icon="i-lucide-check"
            size="xl"
            :loading="loading"
            @click="$emit('confirm')"
        >
            {{ $t('scan.controls.confirm') }}
        </UButton>
    </div>

    <!-- Idle controls -->
    <template v-else>
        <UButton
            class="w-full justify-center font-black uppercase tracking-wider text-xs h-16 shadow-xl shadow-primary-500/10 rounded-2xl"
            icon="i-lucide-camera"
            size="xl"
            @click="$emit('open')"
        >
            {{ $t('scan.controls.open') }}
        </UButton>
    </template>
</template>
