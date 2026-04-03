import { createCameraState } from "./camera/state";
import { openCameraStream, stopCameraStream } from "./camera/stream";
import { sampleFrameLuminance } from "./camera/brightness";
import { drawVideoToCanvas, canvasToBlob } from "./camera/capture";

export const useCameraCapture = () => {
  const toast = useToast();
  const state = createCameraState();

  function clearBrightnessTimer() {
    if (state.brightnessTimer.value) {
      clearInterval(state.brightnessTimer.value);
      state.brightnessTimer.value = null;
    }
  }

  function startBrightnessCheck() {
    clearBrightnessTimer();

    state.brightnessTimer.value = setInterval(() => {
      const video = state.videoRef.value;
      if (!video) return;

      const avg = sampleFrameLuminance(video);
      if (avg == null) return;

      state.qualityWarn.value = avg < 55;
    }, 800);
  }

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
      state.stream.value = await openCameraStream();

      await nextTick();

      const video = state.videoRef.value;
      if (video && state.stream.value) {
        video.srcObject = state.stream.value;
        await video.play();
      }

      state.mode.value = "live";
      startBrightnessCheck();
    } catch (e: any) {
      toast.add({
        title:
          e?.name === "NotAllowedError"
            ? "Camera permission denied"
            : "Could not access camera",
        color: "error",
      });
    }
  }

  async function capturePhoto() {
    const video = state.videoRef.value;
    const canvas = state.canvasRef.value;
    if (!video || !canvas) return;

    clearBrightnessTimer();
    state.qualityWarn.value = false;

    const ok = drawVideoToCanvas(video, canvas);
    if (!ok) return;

    const blob = await canvasToBlob(canvas);
    if (!blob) return;

    state.capturedBlob.value = blob;

    if (state.previewRef.value) {
      state.previewRef.value.src = URL.createObjectURL(blob);
    }

    state.mode.value = "captured";
    stopStream();
  }

  function stopStream() {
    stopCameraStream(state.stream.value);
    state.stream.value = null;
  }

  function retake() {
    state.capturedBlob.value = null;

    if (state.previewRef.value) {
      state.previewRef.value.src = "";
    }

    startCamera();
  }

  function resetToIdle() {
    clearBrightnessTimer();
    stopStream();
    state.capturedBlob.value = null;
    state.mode.value = "idle";
    state.qualityWarn.value = false;
  }

  onUnmounted(resetToIdle);

  return {
    videoRef: state.videoRef,
    canvasRef: state.canvasRef,
    previewRef: state.previewRef,
    mode: state.mode,
    capturedBlob: state.capturedBlob,
    qualityWarn: state.qualityWarn,
    startCamera,
    capturePhoto,
    retake,
    resetToIdle,
  };
};
