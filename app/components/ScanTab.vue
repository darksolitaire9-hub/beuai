<script setup lang="ts">
const { scan, loading } = useReceiptScanner();
const toast = useToast();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const previewRef = ref<HTMLImageElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

function triggerUpload() {
    fileInput.value?.click();
}

async function onFileChange(e: Event) {
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

        <!-- Upload zone — step 7, still inline -->
        <template v-if="mode === 'idle'">
            <USeparator label="or" />
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

        <!-- Processing overlay — step 8, still inline -->
        <Teleport to="body">
            <Transition name="fade">
                <div
                    v-if="loading"
                    class="fixed inset-0 z-50 overflow-hidden"
                    role="status"
                    aria-live="polite"
                >
                    <!-- wave layer — theme-aware, sits behind content -->
                    <div class="scan-wave-bg absolute inset-0" />

                    <!-- content -->
                    <div
                        class="relative z-10 flex flex-col items-center justify-center h-full gap-6"
                    >
                        <UIcon
                            name="i-lucide-scan-line"
                            class="size-12 text-primary animate-pulse"
                        />
                        <div class="text-center">
                            <p class="font-semibold text-lg">
                                Reading receipt…
                            </p>
                            <p class="text-sm text-muted">
                                Extracting your items…
                            </p>
                        </div>
                        <ProcessingSteps />
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style>
/* ─── overlay fade ─────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* ─── wave color tokens — light mode ──────────────────── */
:root {
    --scan-wave-1: #f7f6f2;
    --scan-wave-2: color-mix(in oklch, #01696f 6%, #f7f6f2);
    --scan-wave-3: #f9f8f5;
    --scan-wave-4: color-mix(in oklch, #01696f 10%, #f9f8f5);
}

/* dark mode — Nuxt UI / Tailwind class toggle */
.dark,
[data-theme="dark"] {
    --scan-wave-1: #171614;
    --scan-wave-2: color-mix(in oklch, #4f98a3 10%, #171614);
    --scan-wave-3: #1c1b19;
    --scan-wave-4: color-mix(in oklch, #4f98a3 15%, #1c1b19);
}

/* ─── wave animation ──────────────────────────────────── */
.scan-wave-bg {
    background: linear-gradient(
        -45deg,
        var(--scan-wave-1),
        var(--scan-wave-2),
        var(--scan-wave-3),
        var(--scan-wave-4)
    );
    background-size: 400% 400%;
    animation: scan-wave 5s ease infinite;
}

@keyframes scan-wave {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .scan-wave-bg {
        animation: none;
    }
}
</style>
