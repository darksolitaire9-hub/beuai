<!--
app/components/scan/ScanTab.vue | Component — orchestration only
Orchestrates camera capture, upload flow, and calls useReceiptScanner.
Delegates error mapping to useScanErrorToast and renders the scan UI shell.
Needs: useReceiptScanner, useCameraCapture, useScanErrorToast, CameraFrame,
CameraControls, ScanUploadZone, ScanProcessingOverlay
-->

<script setup lang="ts">
import type { ApiFetchError } from "../../../shared/constants/errors";

const { scan, loading } = useReceiptScanner();
const { show: showScanError } = useScanErrorToast();

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

async function useThis() {
    if (!capturedBlob.value) return;

    try {
        await scan(capturedBlob.value);
        resetToIdle();
    } catch (err) {
        showScanError(err as ApiFetchError);
    }
}

async function onUpload(file: File) {
    try {
        await scan(file);
    } catch (err) {
        showScanError(err as ApiFetchError);
    }
}
</script>

<template>
    <div class="flex flex-col gap-4 p-4">
        <!-- Camera zone -->
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

        <!-- CameraControls -->
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
