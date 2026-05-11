<script setup lang="ts">
const emit = defineEmits<{ upload: [file: File] }>();
const toast = useToast();
const { t } = useI18n();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

function triggerUpload() {
    fileInput.value?.click();
}

function handleFile(file: File) {
    if (["image/heic", "image/heif"].includes(file.type)) {
        toast.add({ title: t('scan.alerts.invalid_format'), color: "warning" });
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        toast.add({ title: t('scan.alerts.too_large'), color: "warning" });
        return;
    }

    emit("upload", file);
}

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (e.target as HTMLInputElement).value = "";
    handleFile(file);
}

function onDrop(e: DragEvent) {
    isDragging.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    handleFile(file);
}
</script>

<template>
    <div
        class="relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-6 text-center cursor-pointer transition-all duration-500 group shadow-inner w-full h-full min-h-[12rem]"
        :class="[
            isDragging 
                ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-950/40 ring-8 ring-primary-500/10' 
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20'
        ]"
        role="button"
        tabindex="0"
        @click="triggerUpload"
        @keydown.enter="triggerUpload"
        @keydown.space.prevent="triggerUpload"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
    >
        <div class="pointer-events-none flex flex-col items-center justify-center gap-6">
            <slot :is-dragging="isDragging">
                <div 
                    class="p-6 rounded-[1.5rem] shadow-sm ring-1 transition-all duration-500"
                    :class="[
                        isDragging 
                            ? 'bg-white dark:bg-neutral-700 ring-primary-500 scale-110 shadow-xl' 
                            : 'bg-neutral-50 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 ring-neutral-200 dark:ring-neutral-700 group-hover:ring-primary-500/50'
                    ]"
                >
                    <UIcon 
                        name="i-lucide-upload-cloud" 
                        class="size-10 transition-colors duration-500" 
                        :class="[isDragging ? 'text-primary-500' : 'text-neutral-400 group-hover:text-primary-500']"
                    />
                </div>
                <div class="space-y-2">
                    <p 
                        class="text-sm font-black uppercase tracking-wider transition-colors duration-500"
                        :class="[isDragging ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-900 dark:text-white']"
                    >
                        {{ $t('scan.choose_file') }}
                    </p>
                    <p class="text-xs text-neutral-400 font-bold tracking-tight">{{ $t('scan.file_limits') }}</p>
                </div>
            </slot>
        </div>

        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
        />
    </div>
</template>
