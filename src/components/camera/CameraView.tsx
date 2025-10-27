// src/components/camera/CameraView.tsx
import React, { useEffect, useRef, useState } from "react";
import type { CameraViewProps, Detection } from "@/types";
import playBeep from "@/utils/play-beep";
import {
  getGrayFromImageData,
  meanBrightness,
  captureFrameDataURL,
  bboxFromMask,
  createZoomedDataURLFromCanvas,
} from "@/utils/frames";

/**
 Props expected:
  - onDetection(detection)
  - enabled (boolean)  // parent handles 5s startup countdown
  - resetBgSignal? (number) // when incremented by parent => reset background now
  - onPauseChange?(paused, remainingMs?) => parent shows pause timer
*/

const PROCESS_FPS = 10;
const ALPHA_BG = 0.02;
const EMA_ALPHA = 0.05;
const DEFAULT_SENSITIVITY_FACTOR = 1.8;
const PAUSE_AFTER_DETECTION_MS = 3000;
const MOTION_CONFIRM_FRAMES = 2;

type Props = CameraViewProps & {
  resetBgSignal?: number;
  onPauseChange?: (paused: boolean, remainingMs?: number) => void;
};

const CameraView: React.FC<Props> = ({
  onDetection,
  enabled,
  resetBgSignal = 0,
  onPauseChange,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // processing canvas
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null); // for dataURL creation and zoom

  // models/state refs
  const bgRef = useRef<Uint8ClampedArray | null>(null);
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef(0);

  const emaAvgAbsDiffRef = useRef<number>(0);
  const emaMeanDiffRef = useRef<number>(0);

  const lastForegroundMaskRef = useRef<Uint8Array | null>(null);
  const maskExpiryAtRef = useRef<number>(0);

  const motionCounterRef = useRef(0);

  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);
  const pauseIntervalRef = useRef<number | null>(null);
  const pauseEndAtRef = useRef<number>(0);

  const [initialBgDataUrl, setInitialBgDataUrl] = useState<string | null>(null);
  const lastResetRef = useRef<number>(resetBgSignal);

  // start camera
  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (!mounted) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        v.addEventListener("loadedmetadata", () => {
          const w = v.videoWidth || 640;
          const h = v.videoHeight || 480;
          if (canvasRef.current) {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
          }
          if (captureCanvasRef.current) {
            captureCanvasRef.current.width = w;
            captureCanvasRef.current.height = h;
          }
        });
      } catch (e) {
        console.error("Camera access error:", e);
      }
    }
    start();
    return () => {
      mounted = false;
      stopProcessing();
      stopStream();
    };
  }, []);

  // enabled toggling (parent handles start countdown; here we just start/stop processing)
  useEffect(() => {
    if (enabled) startProcessing();
    else stopProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // listen reset signal
  useEffect(() => {
    if (resetBgSignal !== lastResetRef.current) {
      lastResetRef.current = resetBgSignal;
      doResetBackground();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetBgSignal]);

  function stopStream() {
    const v = videoRef.current;
    if (v && v.srcObject) {
      const stream = v.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
  }

  function startProcessing() {
    if (runningRef.current) return;
    runningRef.current = true;
    lastProcessTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }

  function stopProcessing() {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    clearPauseTimers();
  }

  function loop(now: number) {
    if (!runningRef.current) return;
    const elapsed = now - lastProcessTimeRef.current;
    const interval = 1000 / PROCESS_FPS;
    if (elapsed >= interval) {
      processOnce();
      lastProcessTimeRef.current = now;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function updateEMA(emaRef: React.MutableRefObject<number>, value: number) {
    if (emaRef.current === 0) emaRef.current = value;
    else emaRef.current = emaRef.current * (1 - EMA_ALPHA) + value * EMA_ALPHA;
    return emaRef.current;
  }

  function captureGrayToCanvas(
    grayArr: Uint8ClampedArray,
    width: number,
    height: number,
    c: HTMLCanvasElement | null
  ) {
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
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
  }

  function clearPauseTimers() {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (pauseIntervalRef.current) {
      clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = null;
    }
    isPausedRef.current = false;
    pauseEndAtRef.current = 0;
    if (onPauseChange) onPauseChange(false);
  }

  function startPauseWithCountdown(ms: number) {
    isPausedRef.current = true;
    pauseEndAtRef.current = Date.now() + ms;
    if (onPauseChange) onPauseChange(true, ms);
    pauseIntervalRef.current = window.setInterval(() => {
      const rem = Math.max(0, pauseEndAtRef.current - Date.now());
      if (onPauseChange) onPauseChange(true, rem);
    }, 200);
    pauseTimeoutRef.current = window.setTimeout(() => {
      clearPauseTimers();
    }, ms);
  }

  async function doResetBackground() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const frame = ctx.getImageData(0, 0, c.width, c.height);
    const currGray = getGrayFromImageData(frame);
    bgRef.current = new Uint8ClampedArray(currGray);
    // reset masks/counters
    lastForegroundMaskRef.current = null;
    maskExpiryAtRef.current = 0;
    prevGrayRef.current = null;
    // also update the "initial background" display (user wanted initial to update on reset)
    if (captureCanvasRef.current) {
      captureGrayToCanvas(
        currGray,
        c.width,
        c.height,
        captureCanvasRef.current
      );
      setInitialBgDataUrl(captureCanvasRef.current.toDataURL("image/png"));
    }
  }

  const processOnce = () => {
    if (isPausedRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.paused || v.ended) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const w = c.width;
    const h = c.height;
    if (!w || !h) return;

    // draw current frame
    ctx.drawImage(v, 0, 0, w, h);
    const frame = ctx.getImageData(0, 0, w, h);
    const currGray = getGrayFromImageData(frame);

    const mean = meanBrightness(currGray);
    const prevGray = prevGrayRef.current;
    const prevMean = prevGray ? meanBrightness(prevGray) : mean;
    const meanDiff = Math.abs(mean - prevMean);

    // init background if missing
    if (!bgRef.current) {
      bgRef.current = new Uint8ClampedArray(currGray);
      // initial bg data url
      if (!initialBgDataUrl && captureCanvasRef.current) {
        captureGrayToCanvas(bgRef.current, w, h, captureCanvasRef.current);
        setInitialBgDataUrl(captureCanvasRef.current.toDataURL("image/png"));
      }
    }

    const bg = bgRef.current;
    const total = currGray.length;

    // avg absolute diff to bg
    let sumAbs = 0;
    for (let i = 0; i < total; i++) sumAbs += Math.abs(currGray[i] - bg[i]);
    const avgAbsDiff = sumAbs / total;

    const emaAvg = updateEMA(emaAvgAbsDiffRef, avgAbsDiff);
    const emaMean = updateEMA(emaMeanDiffRef, meanDiff);

    const adaptivePixelThreshold = Math.max(8, Math.round(emaAvg * 2.5));
    const adaptiveSensitivityRatio = Math.min(
      0.2,
      Math.max(
        0.002,
        DEFAULT_SENSITIVITY_FACTOR * (emaAvg / (emaAvg + 1)) * 0.01 + 0.005
      )
    );
    const adaptiveSuddenLightThresh = Math.max(
      12,
      Math.round(Math.max(emaMean * 3, emaMean + 20))
    );

    // build mask and count changed pixels
    const currMask = new Uint8Array(total);
    let changedCount = 0;
    for (let i = 0; i < total; i++) {
      const d = Math.abs(currGray[i] - bg[i]);
      if (d > adaptivePixelThreshold) {
        currMask[i] = 1;
        changedCount++;
      }
    }
    const ratio = changedCount / total;

    const suddenLight = meanDiff > adaptiveSuddenLightThresh;
    const motionNow = ratio > adaptiveSensitivityRatio;

    if (motionNow) motionCounterRef.current++;
    else motionCounterRef.current = 0;

    const motionConfirmed = motionCounterRef.current >= MOTION_CONFIRM_FRAMES;
    const shouldEmit = suddenLight ? true : motionConfirmed;

    if (shouldEmit) {
      // prepare before/after/background images
      const beforeGray = prevGrayRef.current || currGray;

      // draw grayscale to captureCanvas for image extraction and zoom
      if (captureCanvasRef.current) {
        captureGrayToCanvas(beforeGray, w, h, captureCanvasRef.current);
      }
      const beforeDataUrl = captureCanvasRef.current
        ? captureCanvasRef.current.toDataURL("image/png")
        : "";

      if (captureCanvasRef.current) {
        captureGrayToCanvas(currGray, w, h, captureCanvasRef.current);
      }
      const afterDataUrl = captureCanvasRef.current
        ? captureCanvasRef.current.toDataURL("image/png")
        : "";

      // background image (current bg)
      if (captureCanvasRef.current) {
        captureGrayToCanvas(bg, w, h, captureCanvasRef.current);
      }
      const backgroundDataUrl = captureCanvasRef.current
        ? captureCanvasRef.current.toDataURL("image/png")
        : "";

      // compute bbox from mask and create marked zoomed image
      const bbox = bboxFromMask(currMask, w, h);
      const markedDataUrl = createZoomedDataURLFromCanvas(
        captureCanvasRef.current,
        bbox,
        240,
        160
      );

      const detection: Detection = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        suddenLight,
        motion: motionConfirmed,
        ratio,
        meanDiff,
        before: beforeDataUrl,
        after: afterDataUrl,
        background: backgroundDataUrl,
        marked: markedDataUrl,
        bbox: bbox ?? undefined,
      };

      // emit to parent
      if (typeof onDetection === "function") onDetection(detection);

      // beep
      try {
        playBeep();
      } catch {}

      // set mask and expiry to avoid bg assimilation
      lastForegroundMaskRef.current = currMask;
      maskExpiryAtRef.current = Date.now() + PAUSE_AFTER_DETECTION_MS;

      // pause with countdown for parent
      startPauseWithCountdown(PAUSE_AFTER_DETECTION_MS);
    }

    // update background selectively (skip masked pixels while mask active)
    const mask = lastForegroundMaskRef.current;
    const nowTs = Date.now();
    const maskActive = mask && nowTs < maskExpiryAtRef.current;
    if (!maskActive) {
      for (let i = 0; i < total; i++) {
        bg[i] = Math.round((1 - ALPHA_BG) * bg[i] + ALPHA_BG * currGray[i]);
      }
      lastForegroundMaskRef.current = null;
    } else {
      for (let i = 0; i < total; i++) {
        if (mask[i]) continue;
        bg[i] = Math.round((1 - ALPHA_BG) * bg[i] + ALPHA_BG * currGray[i]);
      }
    }

    prevGrayRef.current = currGray;
  };

  return (
    <section aria-label="Camera Canvas">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: 480, maxWidth: "100%", borderRadius: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              Reference background (initial / last reset):
            </div>
            {initialBgDataUrl ? (
              <img
                src={initialBgDataUrl}
                alt="initial background"
                style={{
                  width: 160,
                  height: 120,
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  marginTop: 6,
                }}
              />
            ) : (
              <div
                style={{
                  width: 160,
                  height: 120,
                  background: "#eee",
                  border: "1px solid #ccc",
                  marginTop: 6,
                }}
              />
            )}
          </div>
        </div>

        <div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <canvas ref={captureCanvasRef} style={{ display: "none" }} />

          <div
            style={{
              background: "#fafafa",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Processing:</strong> {runningRef.current ? "ON" : "OFF"}
            </div>
            <div style={{ fontSize: 12, color: "#333" }}>
              <div>FPS: {PROCESS_FPS}</div>
              <div>BG alpha: {ALPHA_BG}</div>
              <div>EMA alpha: {EMA_ALPHA}</div>
              <div>Pause (ms): {PAUSE_AFTER_DETECTION_MS}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CameraView;
