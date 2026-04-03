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
        class="border border-dashed border-default rounded-xl p-5 flex flex-col items-center gap-2 text-sm text-muted cursor-pointer hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
        role="button"
        tabindex="0"
        @click="triggerUpload"
        @keydown.enter="triggerUpload"
    >
        <UIcon name="i-lucide-upload" class="size-6" />
        Upload from gallery
        <span class="text-xs text-faint">JPEG or PNG · max 10 MB</span>
    </div>
    <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
    />
</template>
