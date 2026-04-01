<script setup lang="ts">
const { step } = useReceiptScanner();
const steps = [
    "Checking image quality",
    "Sending to Gemini",
    "Extracting items & prices",
    "Validating totals",
];
</script>

<template>
    <div class="flex flex-col gap-2 w-56">
        <div
            v-for="(label, i) in steps"
            :key="i"
            class="flex items-center gap-3 text-sm transition-colors"
            :class="{
                'text-faint': step < i + 1,
                'text-default font-medium': step === i + 1,
                'text-success': step > i + 1,
            }"
        >
            <span
                class="size-2 rounded-full flex-shrink-0 transition-all"
                :class="{
                    'bg-muted': step < i + 1,
                    'bg-primary animate-pulse scale-125': step === i + 1,
                    'bg-success': step > i + 1,
                }"
            />
            {{ label }}
        </div>
    </div>
</template>
