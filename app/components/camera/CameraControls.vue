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
    <div v-if="mode === 'live'" class="flex gap-3">
        <UButton variant="outline" icon="i-lucide-x" @click="$emit('cancel')">
            Cancel
        </UButton>
        <UButton
            class="flex-1"
            icon="i-lucide-aperture"
            @click="$emit('capture')"
        >
            Capture
        </UButton>
    </div>

    <!-- Captured controls -->
    <div v-else-if="mode === 'captured'" class="flex gap-3">
        <UButton
            variant="outline"
            icon="i-lucide-rotate-ccw"
            @click="$emit('retake')"
        >
            Retake
        </UButton>
        <UButton
            class="flex-1"
            icon="i-lucide-check"
            :loading="loading"
            @click="$emit('confirm')"
        >
            Scan this
        </UButton>
    </div>

    <!-- Idle controls -->
    <template v-else>
        <UButton
            class="w-full"
            icon="i-lucide-camera"
            size="lg"
            :ui="{ base: 'justify-center' }"
            @click="$emit('open')"
        >
            Open Camera
        </UButton>
    </template>
</template>
