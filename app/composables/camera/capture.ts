export function drawVideoToCanvas(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  try {
    ctx.drawImage(video, 0, 0);
    return true;
  } catch {
    return false;
  }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.85,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}
