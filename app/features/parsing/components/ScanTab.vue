<!--
app/components/scan/ScanTab.vue | Component — orchestration only
Orchestrates camera capture, upload flow, and calls useReceiptScanner.
Delegates error mapping to useScanErrorToast and renders the scan UI shell.
Needs: useReceiptScanner, useCameraCapture, useScanErrorToast, CameraFrame,
CameraControls, ScanUploadZone, ScanProcessingOverlay
-->

<script setup lang="ts">
import type { ApiFetchError } from "../../../../shared/constants/errors";

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
    <div class="flex flex-col gap-6 p-6 h-full">
        <!-- Camera zone -->
        <CameraFrame :mode="mode" :show-quality-warning="qualityWarn" class="aspect-[3/4] md:aspect-video rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden shadow-sm">
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
        <div class="flex items-center justify-center">
            <CameraControls
                :mode="mode"
                :loading="loading"
                @open="startCamera"
                @cancel="resetToIdle"
                @capture="capturePhoto"
                @retake="retake"
                @confirm="useThis"
            />
        </div>

        <!-- Upload zone  -->
        <template v-if="mode === 'idle'">
            <div class="relative py-2">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
                </div>
                <div class="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                    <span class="bg-neutral-50 dark:bg-neutral-950 px-2">or upload file</span>
                </div>
            </div>
            <ScanUploadZone @upload="onUpload" />
        </template>

        <!-- Processing overlay -->
        <ScanProcessingOverlay :visible="loading" />
    </div>
</template>
