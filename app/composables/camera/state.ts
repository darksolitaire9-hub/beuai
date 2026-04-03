export type CameraMode = "idle" | "live" | "captured";

export function createCameraState() {
  return {
    videoRef: ref<HTMLVideoElement | null>(null),
    canvasRef: ref<HTMLCanvasElement | null>(null),
    previewRef: ref<HTMLImageElement | null>(null),
    mode: ref<CameraMode>("idle"),
    capturedBlob: ref<Blob | null>(null),
    qualityWarn: ref(false),
    stream: shallowRef<MediaStream | null>(null),
    brightnessTimer: shallowRef<ReturnType<typeof setInterval> | null>(null),
  };
}
