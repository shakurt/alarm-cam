// src/utils/frames.ts
// Utility functions for frame/grayscale handling, bbox extraction and zoomed images.

/**
 * Convert ImageData (RGBA) to a grayscale Uint8ClampedArray (one byte per pixel).
 */
export function getGrayFromImageData(imageData: ImageData): Uint8ClampedArray {
  const pixels = imageData.data;
  const pixelCount = imageData.width * imageData.height;
  const grayscale = new Uint8ClampedArray(pixelCount);

  let dataIndex = 0;
  for (let i = 0; i < pixelCount; i++) {
    const r = pixels[dataIndex++];
    const g = pixels[dataIndex++];
    const b = pixels[dataIndex++];
    dataIndex++; // skip alpha
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return grayscale;
}

/** Compute mean brightness of a grayscale array */
export function meanBrightness(grayscale: Uint8ClampedArray | null): number {
  if (!grayscale) return 0;

  let sum = 0;
  for (let i = 0; i < grayscale.length; i++) {
    sum += grayscale[i];
  }
  return sum / grayscale.length;
}

/**
 * Create a dataURL PNG from a grayscale array by writing it to the provided canvas.
 * Returns empty string on failure.
 */
export function captureFrameDataURL(
  grayscale: Uint8ClampedArray,
  width: number,
  height: number,
  canvas: HTMLCanvasElement | null
): string {
  if (!canvas) return "";

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(width, height);
  let dataIndex = 0;

  for (let i = 0; i < grayscale.length; i++) {
    const value = grayscale[i];
    imageData.data[dataIndex++] = value;
    imageData.data[dataIndex++] = value;
    imageData.data[dataIndex++] = value;
    imageData.data[dataIndex++] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Given a binary mask (Uint8Array with 0/1) produce bounding box {x,y,w,h}
 * Returns null if no pixel set.
 */
export function bboxFromMask(
  mask: Uint8Array | null,
  width: number,
  height: number
) {
  if (!mask) return null;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      const x = i % width;
      const y = Math.floor(i / width);

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX === -1) return null;

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;

  return { x: minX, y: minY, w: boxWidth, h: boxHeight };
}

/**
 * Create a zoomed DataURL from a source canvas for a given bbox.
 * If bbox is null, returns the canvas.toDataURL().
 * outW/outH specify output size for zoomed crop.
 */
export function createZoomedDataURLFromCanvas(
  sourceCanvas: HTMLCanvasElement | null,
  bbox: { x: number; y: number; w: number; h: number } | null,
  outputWidth = 240,
  outputHeight = 160
): string {
  if (!sourceCanvas) return "";
  if (!bbox) return sourceCanvas.toDataURL("image/png");

  // Create temp canvas for zoomed area
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = outputWidth;
  tempCanvas.height = outputHeight;

  const ctx = tempCanvas.getContext("2d");
  if (!ctx) return sourceCanvas.toDataURL("image/png");

  // Draw the cropped area scaled to output size
  ctx.drawImage(
    sourceCanvas,
    bbox.x,
    bbox.y,
    Math.max(1, bbox.w),
    Math.max(1, bbox.h),
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Draw a red border to emphasize
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, outputWidth - 2, outputHeight - 2);

  return tempCanvas.toDataURL("image/png");
}
