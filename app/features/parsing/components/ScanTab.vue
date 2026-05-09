<!--
app/components/scan/ScanTab.vue | Component — orchestration only
Orchestrates camera capture, upload flow, and calls useReceiptScanner.
Delegates error mapping to useScanErrorToast and renders the scan UI shell.
Needs: useReceiptScanner, useCameraCapture, useScanErrorToast, CameraFrame,
CameraControls, ScanUploadZone, ScanProcessingOverlay
-->

<script setup lang="ts">
import type { ApiFetchError } from "~~/shared/constants/errors";

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
    <div class="flex flex-col gap-10 p-6 md:p-8 min-h-full pb-32 md:pb-12">
        <!-- Header -->
        <div class="space-y-1">
            <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">Rescue Receipt</h2>
            <p class="text-sm font-medium text-neutral-500">Scan or upload a physical receipt to transform it.</p>
        </div>

        <!-- Camera zone -->
        <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Live Capture</p>
            <CameraFrame :mode="mode" :show-quality-warning="qualityWarn" class="aspect-square md:aspect-video rounded-[2.5rem] shadow-2xl ring-2 ring-neutral-200 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden transition-all duration-500">
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
                
                <!-- Overlay for idle state — make it look like a prompt -->
                <div v-if="mode === 'idle'" class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-sm p-8 text-center">
                    <div class="bg-white dark:bg-neutral-800 p-6 rounded-full shadow-2xl mb-4 animate-pulse">
                        <UIcon name="i-lucide-camera" class="size-10 text-primary-500" />
                    </div>
                    <p class="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Ready to Scan</p>
                </div>
            </CameraFrame>

            <!-- CameraControls -->
            <div class="flex items-center justify-center pt-2">
                <CameraControls
                    :mode="mode"
                    :loading="loading"
                    class="w-full max-w-sm h-14"
                    @open="startCamera"
                    @cancel="resetToIdle"
                    @capture="capturePhoto"
                    @retake="retake"
                    @confirm="useThis"
                />
            </div>
        </div>

        <!-- Upload zone  -->
        <template v-if="mode === 'idle'">
            <div class="relative py-4">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-neutral-100 dark:border-neutral-800"></div>
                </div>
                <div class="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">
                    <span class="bg-neutral-50 dark:bg-neutral-950 px-4">OR USE FILE</span>
                </div>
            </div>
            
            <div class="space-y-4">
                 <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Digital Upload</p>
                 <ScanUploadZone @upload="onUpload" />
            </div>
        </template>

        <!-- Processing overlay -->
        <ScanProcessingOverlay :visible="loading" />
    </div>
</template>
