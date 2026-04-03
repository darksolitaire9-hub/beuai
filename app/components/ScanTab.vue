<script setup lang="ts">
const { scan, loading } = useReceiptScanner();
const toast = useToast();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const previewRef = ref<HTMLImageElement | null>(null);

const mode = ref<"idle" | "live" | "captured">("idle");
const capturedBlob = ref<Blob | null>(null);
const qualityWarn = ref(false);
let stream: MediaStream | null = null;
let brightnessTimer: ReturnType<typeof setInterval> | null = null;

async function startCamera() {
    if (
        !location.protocol.includes("https") &&
        location.hostname !== "localhost"
    ) {
        toast.add({
            title: "HTTPS required for camera access",
            color: "error",
        });
        return;
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 1920 },
            },
        });
        await nextTick();
        if (videoRef.value) {
            videoRef.value.srcObject = stream;
            await videoRef.value.play();
        }
        mode.value = "live";
        startBrightnessCheck();
    } catch (e: any) {
        toast.add({
            title:
                e.name === "NotAllowedError"
                    ? "Camera permission denied"
                    : "Could not access camera",
            color: "error",
        });
    }
}

function startBrightnessCheck() {
    brightnessTimer = setInterval(() => {
        if (!videoRef.value?.videoWidth) return;
        const c = document.createElement("canvas");
        c.width = 40;
        c.height = 40;
        c.getContext("2d")!.drawImage(videoRef.value, 0, 0, 40, 40);
        const d = c.getContext("2d")!.getImageData(0, 0, 40, 40).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) {
            sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
        }
        qualityWarn.value = sum / (d.length / 4) < 55;
    }, 800);
}

function capturePhoto() {
    if (!videoRef.value || !canvasRef.value) return;
    clearInterval(brightnessTimer!);
    qualityWarn.value = false;
    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    canvasRef.value.getContext("2d")!.drawImage(videoRef.value, 0, 0);
    canvasRef.value.toBlob(
        (blob) => {
            if (!blob) return;
            capturedBlob.value = blob;
            if (previewRef.value) {
                previewRef.value.src = URL.createObjectURL(blob);
            }
            mode.value = "captured";
            stopStream();
        },
        "image/jpeg",
        0.85,
    );
}

function stopStream() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
}

function retake() {
    capturedBlob.value = null;
    if (previewRef.value) previewRef.value.src = "";
    startCamera();
}

function resetToIdle() {
    clearInterval(brightnessTimer!);
    stopStream();
    capturedBlob.value = null;
    mode.value = "idle";
    qualityWarn.value = false;
}

onUnmounted(resetToIdle);

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
            <UploadZone @upload="onUpload" />
        </template>

        <!-- Processing overlay -->
        <ProcessingOverlay :visible="loading" />
    </div>
</template>
