// src/utils/frames.ts
// Utility functions for frame/grayscale handling, bbox extraction and zoomed images.

/**
 * Convert ImageData (RGBA) to a grayscale Uint8ClampedArray (one byte per pixel).
 */
export function getGrayFromImageData(imageData: ImageData): Uint8ClampedArray {
  const data = imageData.data;
  const n = imageData.width * imageData.height;
  const out = new Uint8ClampedArray(n);
  let di = 0;
  for (let i = 0; i < n; i++) {
    const r = data[di++];
    const g = data[di++];
    const b = data[di++];
    di++; // alpha
    out[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return out;
}

/** Compute mean brightness of a grayscale array */
export function meanBrightness(grayArr: Uint8ClampedArray | null): number {
  if (!grayArr) return 0;
  let s = 0;
  for (let i = 0; i < grayArr.length; i++) s += grayArr[i];
  return s / grayArr.length;
}

/**
 * Create a dataURL PNG from a grayscale array by writing it to the provided canvas.
 * Returns empty string on failure.
 */
export function captureFrameDataURL(
  grayArr: Uint8ClampedArray,
  width: number,
  height: number,
  c: HTMLCanvasElement | null
): string {
  if (!c) return "";
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(width, height);
  let idx = 0;
  for (let i = 0; i < grayArr.length; i++) {
    const v = grayArr[i];
    img.data[idx++] = v;
    img.data[idx++] = v;
    img.data[idx++] = v;
    img.data[idx++] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
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
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
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
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return { x: minX, y: minY, w, h };
}

/**
 * Create a zoomed DataURL from a source canvas for a given bbox.
 * If bbox is null, returns the canvas.toDataURL().
 * outW/outH specify output size for zoomed crop.
 */
export function createZoomedDataURLFromCanvas(
  sourceCanvas: HTMLCanvasElement | null,
  bbox: { x: number; y: number; w: number; h: number } | null,
  outW = 240,
  outH = 160
): string {
  if (!sourceCanvas) return "";
  if (!bbox) {
    return sourceCanvas.toDataURL("image/png");
  }
  // create temp canvas for zoomed area
  const tmp = document.createElement("canvas");
  tmp.width = outW;
  tmp.height = outH;
  const tctx = tmp.getContext("2d");
  if (!tctx) return sourceCanvas.toDataURL("image/png");
  // draw the cropped area scaled to outW/outH
  tctx.drawImage(
    sourceCanvas,
    bbox.x,
    bbox.y,
    Math.max(1, bbox.w),
    Math.max(1, bbox.h),
    0,
    0,
    outW,
    outH
  );
  // draw a red border to emphasize
  tctx.strokeStyle = "red";
  tctx.lineWidth = 3;
  tctx.strokeRect(1, 1, outW - 2, outH - 2);
  return tmp.toDataURL("image/png");
}
