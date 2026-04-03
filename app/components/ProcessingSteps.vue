<script setup lang="ts">
const { step } = useReceiptScanner();
const steps = [
    "Checking image quality",
    "Reading the receipt",
    "Extracting items & prices",
    "Validating totals",
];
</script>

<template>
    <div class="flex flex-col gap-3 w-56">
        <div
            v-for="(label, i) in steps"
            :key="i"
            class="flex items-center gap-3 text-sm transition-all duration-300"
            :class="{
                'text-faint opacity-50': step < i + 1,
                'text-default font-medium': step === i + 1,
                'text-muted': step > i + 1,
            }"
        >
            <!-- indicator -->
            <span
                class="relative size-5 flex-shrink-0 flex items-center justify-center"
            >
                <!-- pending / active dot -->
                <span
                    class="absolute size-2 rounded-full transition-all duration-300"
                    :class="{
                        'opacity-0 scale-0': step > i + 1,
                        'bg-muted/60 opacity-100 scale-100': step < i + 1,
                        'bg-primary animate-pulse scale-125 opacity-100':
                            step === i + 1,
                    }"
                />
                <!-- completed checkmark -->
                <UIcon
                    name="i-lucide-check"
                    class="absolute size-4 text-success transition-all duration-300"
                    :class="{
                        'opacity-0 scale-0': step <= i + 1,
                        'opacity-100 scale-100': step > i + 1,
                    }"
                />
            </span>

            <span>{{ label }}</span>
        </div>
    </div>
</template>
