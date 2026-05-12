<!--
app/components/scan/ScanTab.vue | Component — orchestration only
Orchestrates camera capture, upload flow, and calls useReceiptScanner.
Delegates error mapping to useScanErrorToast and renders the scan UI shell.
Needs: useReceiptScanner, useCameraCapture, useScanErrorToast, CameraFrame,
CameraControls, ScanUploadZone, ScanProcessingOverlay
-->

<script setup lang="ts">
import type { ApiFetchError } from "~~/shared/constants/errors";

const { scan, loading, result } = useReceiptScanner();
const { save } = useReceiptHistory();
const { show: showScanError } = useScanErrorToast();
const setTab = inject<(tab: string) => void>("setTab");

const {
    videoRef,
    canvasRef,
    mode,
    capturedBlob,
    qualityWarn,
    startCamera,
    capturePhoto,
    retake,
    resetToIdle,
} = useCameraCapture();

async function handleCapture() {
    await capturePhoto();
    await useThis();
}

async function useThis() {
    if (!capturedBlob.value) return;

    try {
        await scan(capturedBlob.value);
        if (result.value) {
            await save(result.value);
            resetToIdle();
            if (setTab) setTab("history");
        }
    } catch (err) {
        showScanError(err as ApiFetchError);
    }
}

async function onUpload(file: File) {
    try {
        await scan(file);
        if (result.value) {
            await save(result.value);
            if (setTab) setTab("history");
        }
    } catch (err) {
        showScanError(err as ApiFetchError);
    }
}
</script>

<template>
    <div class="w-full h-full">
        <div class="flex flex-col gap-10 p-6 md:p-8 min-h-full pb-32 md:pb-12">
            <!-- Header -->
            <div class="space-y-1">
                <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('scan.title') }}</h2>
                <p class="text-sm font-medium text-neutral-500">{{ $t('scan.subtitle') }}</p>
            </div>

            <!-- Mobile: Camera + Upload -->
            <div class="md:hidden space-y-10">
                <!-- Camera zone -->
                <div class="space-y-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">{{ $t('scan.live_capture') }}</p>
                    <CameraFrame :mode="mode" :show-quality-warning="qualityWarn" class="aspect-square rounded-[2.5rem] shadow-2xl ring-2 ring-neutral-200 dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden transition-all duration-500">
                        <video
                            v-show="mode === 'live'"
                            ref="videoRef"
                            class="absolute inset-0 w-full h-full object-cover"
                            playsinline
                            muted
                            autoplay
                        />
                        <canvas ref="canvasRef" class="hidden" />
                        
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
                            :loading="loading"
                            class="w-full max-w-sm h-14"
                            @open="startCamera"
                            @cancel="resetToIdle"
                            @capture="handleCapture"
                            @retake="retake"
                            @confirm="useThis"
                        />
                    </div>
                </div>

                <!-- Small Upload zone for mobile -->
                <div v-if="mode === 'idle'" class="space-y-4">
                    <div class="relative py-4">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-neutral-100 dark:border-neutral-800"></div>
                        </div>
                        <div class="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">
                            <span class="bg-neutral-50 dark:bg-neutral-950 px-4">{{ $t('scan.or_use_file') }}</span>
                        </div>
                    </div>
                    <ScanUploadZone @upload="onUpload" />
                </div>
            </div>

            <!-- Desktop: Dominant Upload Zone (No Camera) -->
            <div class="hidden md:flex flex-col flex-1 min-h-[500px]">
                <ScanUploadZone 
                    @upload="onUpload" 
                    class="flex-1 !border-4 !rounded-[3rem] !p-12"
                    v-slot="{ isDragging }"
                >
                    <div 
                        class="p-10 rounded-[2.5rem] mb-8 transition-all duration-500 shadow-sm ring-2"
                        :class="[
                            isDragging 
                                ? 'bg-white dark:bg-neutral-800 ring-primary-500 scale-110 shadow-xl' 
                                : 'bg-primary-50 dark:bg-primary-950/20 ring-transparent group-hover:scale-110 shadow-sm'
                        ]"
                    >
                        <UIcon 
                            name="i-lucide-upload-cloud" 
                            class="size-20 transition-colors duration-500 text-primary-500"
                        />
                    </div>
                    <h3 
                        class="text-3xl font-black tracking-tighter mb-4 transition-colors duration-500"
                        :class="[isDragging ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-900 dark:text-white']"
                    >
                        {{ $t('scan.choose_file') }}
                    </h3>
                    <p 
                        class="font-bold max-w-sm mx-auto leading-relaxed mb-10 transition-colors duration-500"
                        :class="[isDragging ? 'text-primary-500/80' : 'text-neutral-500']"
                    >
                        {{ $t('scan.desktop_drag_drop') }}
                    </p>
                </ScanUploadZone>
            </div>

            <!-- Processing overlay -->
            <ScanProcessingOverlay :visible="loading" />
        </div>
    </div>
</template>
