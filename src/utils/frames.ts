export const getGrayFromImageData = (imageData: ImageData) => {
  const data = imageData.data; // [R, G, B, A]
  const n = imageData.width * imageData.height; // check how many pixels are in the image
  const out = new Uint8ClampedArray(n);
  let di = 0;
  for (let i = 0; i < n; i++) {
    const r = data[di++];
    const g = data[di++];
    const b = data[di++];
    di++; // skip alpha
    out[i] = Math.round(0.3 * r + 0.6 * g + 0.1 * b);
  }
  return out;
};

// Compute mean brightness of a grayscale image. example 50 is low but 200 is high
export const meanBrightness = (grayArr: Uint8ClampedArray | null) => {
  if (!grayArr) return 0;
  let s = 0;
  for (let i = 0; i < grayArr.length; i++) s += grayArr[i];
  return s / grayArr.length;
};

// helper: create dataURL from a grayscale Uint8ClampedArray (width, height)
// EXPERIMENTAL (Using AI)
export const captureFrameDataURL = (
  grayArr: Uint8ClampedArray,
  width: number,
  height: number,
  c: HTMLCanvasElement | null
) => {
  if (!c) return "";

  const ctx2 = c.getContext("2d");
  if (!ctx2) return "";

  // create ImageData RGBA
  const img = ctx2.createImageData(width, height);
  let idx = 0;
  for (let i = 0; i < grayArr.length; i++) {
    const v = grayArr[i];
    img.data[idx++] = v;
    img.data[idx++] = v;
    img.data[idx++] = v;
    img.data[idx++] = 255;
  }
  ctx2.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
};
