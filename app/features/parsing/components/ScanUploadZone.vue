<script setup lang="ts">
const emit = defineEmits<{ upload: [file: File] }>();
const toast = useToast();
const { t } = useI18n();
const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
    fileInput.value?.click();
}

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (["image/heic", "image/heif"].includes(file.type)) {
        toast.add({ title: t('scan.alerts.invalid_format'), color: "warning" });
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        toast.add({ title: t('scan.alerts.too_large'), color: "warning" });
        return;
    }
    (e.target as HTMLInputElement).value = "";
    emit("upload", file);
}
</script>

<template>
    <div
        class="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-10 flex flex-col items-center gap-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all duration-300 group shadow-inner"
        role="button"
        tabindex="0"
        @click="triggerUpload"
        @keydown.enter="triggerUpload"
        @keydown.space.prevent="triggerUpload"
    >
        <div class="p-5 rounded-[1.5rem] bg-neutral-50 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700 group-hover:ring-primary-500/50 transition-all duration-300 group-active:scale-90">
            <UIcon name="i-lucide-upload-cloud" class="size-8 text-neutral-400 group-hover:text-primary-500 transition-colors" />
        </div>
        <div class="space-y-1">
            <p class="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{{ $t('scan.choose_file') }}</p>
            <p class="text-xs text-neutral-400 font-bold tracking-tight">{{ $t('scan.file_limits') }}</p>
        </div>
    </div>
    <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
    />
</template>
