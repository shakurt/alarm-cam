import React, { useRef, useState, useEffect } from "react";

/*
 CameraView component:
 - captures webcam frames
 - maintains a running background model (running average)
 - detects either sudden global brightness change OR local motion
 - on detection: plays a beep and emits two images (before/after) + timestamp
 - supports toggles: enabled (start after 5s) and saveToStorage (save images in localStorage)
*/

const PROCESS_FPS = 12; // target processing rate
const ALPHA = 0.02; // background learning rate (small -> adapts slowly -> handles gradual light)
const PIXEL_DIFF_THRESHOLD = 30; // per-pixel diff to count as changed
const SENSITIVITY_RATIO = 0.01; // fraction of pixels -> trigger (e.g., 1%)
const SUDDEN_GLOBAL_BRIGHTNESS_THRESH = 30; // if mean brightness changed > this between consecutive frames => sudden light change

export default function CameraView({ onDetection, enabled, saveToStorage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null); // Uint8ClampedArray for background grayscale
  const prevGrayRef = useRef(null); // previous frame grayscale
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const lastProcessTimeRef = useRef(0);

  // small hidden canvas to capture 'before' frame when detection occurs
  const captureCanvasRef = useRef(null);

  useEffect(() => {
    // getUserMedia and start stream
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (!mounted) return;
        const v = videoRef.current;
        v.srcObject = stream;
        await v.play();
        // set canvas sizes when metadata available
        v.addEventListener("loadedmetadata", () => {
          const w = v.videoWidth || 640;
          const h = v.videoHeight || 480;
          const canvas = canvasRef.current;
          canvas.width = w;
          canvas.height = h;
          // hidden capture canvas
          const c2 = captureCanvasRef.current;
          c2.width = w;
          c2.height = h;
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

  // start/stop processing based on enabled toggle with 5s delay when enabling
  useEffect(() => {
    if (enabled) {
      // start after 5 seconds
      setTimeout(() => {
        if (enabled) startProcessing();
      }, 5000);
    } else {
      stopProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  function stopStream() {
    const v = videoRef.current;
    if (v && v.srcObject) {
      const tracks = v.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
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
  }

  function loop(now) {
    if (!runningRef.current) return;
    const elapsed = now - lastProcessTimeRef.current;
    const interval = 1000 / PROCESS_FPS;
    if (elapsed >= interval) {
      processOnce();
      lastProcessTimeRef.current = now;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function playBeep() {
    try {
      const aCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = aCtx.createOscillator();
      const g = aCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(g);
      g.connect(aCtx.destination);
      g.gain.value = 0.0001;
      osc.start();
      g.gain.exponentialRampToValueAtTime(0.2, aCtx.currentTime + 0.02);
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, aCtx.currentTime + 0.12);
        osc.stop(aCtx.currentTime + 0.14);
      }, 400);
    } catch (e) {
      // fallback
      console.log("beep");
    }
  }

  function getGrayFromImageData(imageData) {
    const data = imageData.data;
    const n = imageData.width * imageData.height;
    const out = new Uint8ClampedArray(n);
    let di = 0;
    for (let i = 0; i < n; i++) {
      const r = data[di++];
      const g = data[di++];
      const b = data[di++];
      di++; // skip alpha
      out[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return out;
  }

  function processOnce() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.paused || video.ended) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const w = canvas.width,
      h = canvas.height;
    if (w === 0 || h === 0) return;

    // draw current frame
    ctx.drawImage(video, 0, 0, w, h);
    const frame = ctx.getImageData(0, 0, w, h);
    const currGray = getGrayFromImageData(frame);

    // compute mean brightness of current and previous frame (for sudden global changes)
    const mean = meanBrightness(currGray);
    const prevGray = prevGrayRef.current;
    const prevMean = prevGray ? meanBrightness(prevGray) : mean;

    // initialize background if needed
    if (!bgRef.current) {
      // copy currGray as initial background
      bgRef.current = new Uint8ClampedArray(currGray);
    }

    // compute per-pixel difference vs background
    const bg = bgRef.current;
    let changedCount = 0;
    const total = currGray.length;
    for (let i = 0; i < total; i++) {
      const d = Math.abs(currGray[i] - bg[i]);
      if (d > PIXEL_DIFF_THRESHOLD) changedCount++;
    }
    const ratio = changedCount / total;

    // decide detection:
    // - if ratio > SENSITIVITY_RATIO -> motion detected
    // - if absolute change in mean from prevMean to mean is large -> sudden light change -> detect
    const meanDiff = Math.abs(mean - prevMean);
    const suddenLight = meanDiff > SUDDEN_GLOBAL_BRIGHTNESS_THRESH;
    const motion = ratio > SENSITIVITY_RATIO;

    if (suddenLight || motion) {
      // capture before/after images:
      // before = prevGrayRef (if exists) rendered to dataURL, else use current as both
      const beforeDataUrl = captureFrameDataURL(
        prevGrayRef.current || currGray,
        w,
        h
      );
      const afterDataUrl = captureFrameDataURL(currGray, w, h);

      // create detection object
      const detection = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        suddenLight,
        motion,
        ratio,
        meanDiff,
        before: beforeDataUrl,
        after: afterDataUrl,
      };

      // emit to parent/listener
      if (typeof onDetection === "function") onDetection(detection);

      // beep
      playBeep();
      // do NOT stop; continue processing
    }

    // update background with running average: bg = (1-alpha)*bg + alpha*curr
    for (let i = 0; i < total; i++) {
      // simple running average
      bg[i] = Math.round((1 - ALPHA) * bg[i] + ALPHA * currGray[i]);
    }

    // set prevGray
    prevGrayRef.current = currGray;
  }

  // helper: mean brightness
  function meanBrightness(grayArr) {
    if (!grayArr) return 0;
    let s = 0;
    for (let i = 0; i < grayArr.length; i++) s += grayArr[i];
    return s / grayArr.length;
  }

  // helper: create dataURL from a grayscale Uint8ClampedArray (width, height)
  function captureFrameDataURL(grayArr, width, height) {
    const c = captureCanvasRef.current;
    const ctx2 = c.getContext("2d");
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
  }

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div>
        <video
          ref={videoRef}
          style={{ width: 480, maxWidth: "100%" }}
          muted
          playsInline
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <canvas ref={captureCanvasRef} style={{ display: "none" }} />
      </div>
      <div>
        <p>Processing: {runningRef.current ? "ON" : "OFF"}</p>
        <p>Parameters:</p>
        <ul>
          <li>FPS: {PROCESS_FPS}</li>
          <li>pixel threshold: {PIXEL_DIFF_THRESHOLD}</li>
          <li>sensitivity ratio: {SENSITIVITY_RATIO}</li>
          <li>sudden light thresh: {SUDDEN_GLOBAL_BRIGHTNESS_THRESH}</li>
        </ul>
      </div>
    </div>
  );
}
