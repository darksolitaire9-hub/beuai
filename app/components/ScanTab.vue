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
        for (let i = 0; i < d.length; i += 4)
            sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
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
            if (previewRef.value)
                previewRef.value.src = URL.createObjectURL(blob);
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

async function useThis() {
    if (!capturedBlob.value) return;
    try {
        await scan(capturedBlob.value);
        resetToIdle();
    } catch {
        toast.add({
            title: "Could not read receipt — try again",
            color: "error",
        });
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
        toast.add({ title: "Image too large — max 10MB", color: "warning" });
        return;
    }
    (e.target as HTMLInputElement).value = "";
    try {
        await scan(file);
    } catch {
        toast.add({
            title: "Could not read receipt — try again",
            color: "error",
        });
    }
}
</script>

<template>
    <div class="flex flex-col gap-4 p-4">
        <!-- Camera zone -->
        <div
            class="relative rounded-2xl overflow-hidden bg-elevated aspect-[3/4] w-full flex items-center justify-center"
            :class="
                mode === 'captured'
                    ? 'ring-2 ring-primary'
                    : 'ring-1 ring-dashed ring-default'
            "
        >
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

            <div
                v-if="mode === 'idle'"
                class="flex flex-col items-center gap-3 p-6 text-center"
            >
                <UIcon name="i-lucide-camera" class="size-10 text-muted" />
                <p class="text-sm text-muted max-w-[22ch]">
                    Point camera at your receipt
                </p>
            </div>

            <template v-if="mode === 'live'">
                <div
                    class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl opacity-70"
                />
                <div
                    class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr opacity-70"
                />
                <div
                    class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl opacity-70"
                />
                <div
                    class="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br opacity-70"
                />
            </template>

            <Transition name="fade">
                <UAlert
                    v-if="qualityWarn"
                    icon="i-lucide-sun"
                    color="warning"
                    variant="soft"
                    title="Too dark — try better lighting"
                    class="absolute bottom-3 left-3 right-3 text-xs"
                />
            </Transition>
        </div>

        <div v-if="mode === 'live'" class="flex gap-3">
            <UButton variant="outline" icon="i-lucide-x" @click="resetToIdle"
                >Cancel</UButton
            >
            <UButton
                class="flex-1"
                icon="i-lucide-aperture"
                @click="capturePhoto"
                >Capture</UButton
            >
        </div>

        <div v-else-if="mode === 'captured'" class="flex gap-3">
            <UButton
                variant="outline"
                icon="i-lucide-rotate-ccw"
                @click="retake"
                >Retake</UButton
            >
            <UButton
                class="flex-1"
                icon="i-lucide-check"
                :loading="loading"
                @click="useThis"
                >Scan this</UButton
            >
        </div>

        <template v-else>
            <UButton
                class="w-full"
                icon="i-lucide-camera"
                size="lg"
                :ui="{ base: 'justify-center' }"
                @click="startCamera"
                >Open Camera</UButton
            >
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
                <span class="text-xs text-faint">JPEG, PNG, HEIC accepted</span>
            </div>
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                capture="environment"
                @change="onFileChange"
            />
        </template>

        <Teleport to="body">
            <Transition name="fade">
                <div
                    v-if="loading"
                    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-default/90 backdrop-blur-sm"
                    role="status"
                    aria-live="polite"
                >
                    <UIcon
                        name="i-lucide-scan-line"
                        class="size-12 text-primary animate-pulse"
                    />
                    <div class="text-center">
                        <p class="font-semibold text-lg">Reading receipt…</p>
                        <p class="text-sm text-muted">
                            Gemini is extracting your items
                        </p>
                    </div>
                    <ProcessingSteps />
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
