<script setup lang="ts">
const { scan, loading } = useReceiptScanner();
const toast = useToast();

const {
    videoRef,
    canvasRef,
    previewRef,
    mode,
    capturedBlob,
    qualityWarn,
    startCamera,
    capturePhoto,
    retake,
    resetToIdle,
} = useCameraCapture();

function toastForError(err: any) {
    const code = err?.statusCode ?? err?.status;
    const messages: Record<number, string> = {
        429: "Too many requests — wait a moment and retry",
        503: "Service temporarily unavailable — try again later",
        502: "Could not read receipt — try again",
        422: "Receipt could not be parsed — try a clearer image",
    };

    toast.add({
        title: messages[code] ?? "Could not read receipt — try again",
        color: "error",
    });
}

async function useThis() {
    if (!capturedBlob.value) return;

    try {
        await scan(capturedBlob.value);
        resetToIdle();
    } catch (err: any) {
        toastForError(err);
    }
}

async function onUpload(file: File) {
    try {
        await scan(file);
    } catch (err: any) {
        toastForError(err);
    }
}
</script>

<template>
    <div class="flex flex-col gap-4 p-4">
        <!-- Camera zone — step 5 -->
        <CameraFrame :mode="mode" :show-quality-warning="qualityWarn">
            <video
                v-show="mode === 'live'"
                ref="videoRef"
                class="absolute inset-0 w-full h-full object-cover"
                playsinline
                muted
                autoplay
            />
            <canvas ref="canvasRef" class="hidden" />
            <img
                v-show="mode === 'captured'"
                ref="previewRef"
                alt="Captured receipt"
                class="absolute inset-0 w-full h-full object-cover"
            />
        </CameraFrame>

        <!-- Step 6: CameraControls -->
        <CameraControls
            :mode="mode"
            :loading="loading"
            @open="startCamera"
            @cancel="resetToIdle"
            @capture="capturePhoto"
            @retake="retake"
            @confirm="useThis"
        />

        <!-- Upload zone  -->
        <template v-if="mode === 'idle'">
            <USeparator label="or" />
            <ScanUploadZone @upload="onUpload" />
        </template>

        <!-- Processing overlay -->
        <ScanProcessingOverlay :visible="loading" />
    </div>
</template>
