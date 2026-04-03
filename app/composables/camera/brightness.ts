export function computeAverageLuminance(
  data: Uint8ClampedArray,
): number | null {
  if (data.length % 4 !== 0) return null;

  const pixelCount = data.length / 4;
  if (!pixelCount) return null;

  let sum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    sum += (r + g + b) / 3;
  }

  return sum / pixelCount;
}

export function sampleFrameLuminance(video: HTMLVideoElement): number | null {
  if (!video.videoWidth || !video.videoHeight) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const SAMPLE_SIZE = 40;
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;

  try {
    ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    return computeAverageLuminance(data);
  } catch {
    return null;
  }
}
