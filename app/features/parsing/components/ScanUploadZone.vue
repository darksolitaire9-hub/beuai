<script setup lang="ts">
const emit = defineEmits<{ upload: [file: File] }>();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
    fileInput.value?.click();
}

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (["image/heic", "image/heif"].includes(file.type)) {
        toast.add({ title: "Please use JPEG or PNG format", color: "warning" });
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        toast.add({ title: "Image too large — max 10 MB", color: "warning" });
        return;
    }
    (e.target as HTMLInputElement).value = "";
    emit("upload", file);
}
</script>

<template>
    <div
        class="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all group"
        role="button"
        tabindex="0"
        @click="triggerUpload"
        @keydown.enter="triggerUpload"
        @keydown.space.prevent="triggerUpload"
    >
        <div class="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/30 transition-colors">
            <UIcon name="i-lucide-upload-cloud" class="size-6 text-neutral-500 group-hover:text-primary-600 transition-colors" />
        </div>
        <div>
            <p class="text-sm font-bold text-neutral-900 dark:text-white">Click or drag to upload</p>
            <p class="text-xs text-neutral-500 mt-1">JPEG, PNG up to 10 MB</p>
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
