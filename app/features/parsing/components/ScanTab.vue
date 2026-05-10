<!--
app/components/scan/ScanTab.vue | Component — orchestration only
Orchestrates camera capture, upload flow, and calls useReceiptScanner.
Delegates error mapping to useScanErrorToast and renders the scan UI shell.
Needs: useReceiptScanner, useCameraCapture, useScanErrorToast, CameraFrame,
CameraControls, ScanUploadZone, ScanProcessingOverlay
-->

<script setup lang="ts">
import type { ApiFetchError } from "~~/shared/constants/errors";

const { queue, addFiles, processNext, processing } = useDocumentQueue();
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

    // Treat capture as a single-file list
    const file = new File([capturedBlob.value], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    addFiles([file]);
    resetToIdle();
    await processNext();
}

async function onUpload(files: File[]) {
    addFiles(files);
    await processNext();
}
</script>

<template>
    <div class="flex flex-col gap-10 p-6 md:p-8 min-h-full pb-32 md:pb-12">
        <!-- Header -->
        <div class="space-y-1">
            <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('scan.title') }}</h2>
            <p class="text-sm font-medium text-neutral-500">{{ $t('scan.subtitle') }}</p>
        </div>

        <!-- Queue Status (Mini version) -->
        <div v-if="queue.length > 0" class="p-4 bg-primary-50 dark:bg-primary-950/30 rounded-2xl border border-primary-100 dark:border-primary-900/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-primary-500 rounded-full animate-pulse" v-if="processing">
                    <UIcon name="i-lucide-loader-2" class="size-4 text-white animate-spin" />
                </div>
                <div class="p-2 bg-primary-500 rounded-full" v-else>
                    <UIcon name="i-lucide-list-checks" class="size-4 text-white" />
                </div>
                <div>
                    <p class="text-xs font-black uppercase tracking-widest text-primary-900 dark:text-primary-100">Queue Active</p>
                    <p class="text-[10px] font-bold text-primary-600 dark:text-primary-400">{{ queue.length }} items total</p>
                </div>
            </div>
            <UButton variant="soft" color="primary" size="xs" @click="() => $emit('setTab', 'results')">Review Results</UButton>
        </div>

        <!-- Camera zone -->
        <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">{{ $t('scan.live_capture') }}</p>
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
                
                <!-- Overlay for idle state -->
                <div v-if="mode === 'idle'" class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-sm p-8 text-center">
                    <div class="bg-white dark:bg-neutral-800 p-6 rounded-full shadow-2xl mb-4 animate-pulse">
                        <UIcon name="i-lucide-camera" class="size-10 text-primary-500" />
                    </div>
                    <p class="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{{ $t('scan.ready') }}</p>
                </div>
            </CameraFrame>

            <!-- CameraControls -->
            <div class="flex items-center justify-center pt-2">
                <CameraControls
                    :mode="mode"
                    :loading="processing"
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
                    <span class="bg-neutral-50 dark:bg-neutral-950 px-4">{{ $t('scan.or_use_file') }}</span>
                </div>
            </div>
            
            <div class="space-y-4">
                 <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">{{ $t('scan.digital_upload') }}</p>
                 <ScanUploadZone @upload="onUpload" />
            </div>
        </template>

        <!-- Processing overlay -->
        <ScanProcessingOverlay :visible="processing" />
    </div>
</template>
