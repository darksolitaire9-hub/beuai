import imageCompression from "browser-image-compression";

/**
 * useImageCompression | Composable | Parsing
 * Encapsulates logic for client-side image optimization.
 * Automatically rotates based on EXIF, then strips all metadata.
 * Limits resolution and size for fast OCR-friendly uploads.
 */
export const useImageCompression = () => {
  const compressForOcr = async (file: File | Blob): Promise<File | Blob> => {
    const options = {
      maxSizeMB: 1.5, // Reduced for faster low-bandwidth pushing
      maxWidthOrHeight: 2048, // High enough for small receipt text
      useWebWorker: true,
      exifOrientation: true, // Crucial: auto-rotates pixels, THEN strips EXIF
      initialQuality: 0.85,
    };

    try {
      // browser-image-compression inherently strips EXIF metadata from the result
      return await imageCompression(file as File, options);
    } catch (error) {
      console.error("Image compression failed, using original file", error);
      return file;
    }
  };

  return { compressForOcr };
};
