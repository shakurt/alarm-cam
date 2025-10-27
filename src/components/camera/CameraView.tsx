import { useEffect, useRef } from "react";
import type React from "react";
import type { CameraViewProps } from "@/types";
import playBeep from "@/utils/play-beep";
import {
  getGrayFromImageData,
  meanBrightness,
  captureFrameDataURL,
} from "@/utils/frames";

// Each Second, Process 10 Frames with processOnce func
const PROCESS_FPS = 10;

// Background Learning Rate (small -> adapts slowly -> handles gradual light)
const ALPHA = 0.02;

// Per-Pixel Diff to Count as Changed (Each Pixel is between 0-255)
const PIXEL_DIFF_THRESHOLD = 30;

// Fraction of Pixels -> Trigger (e.g., 1%)
// If the image has 100,000 pixels and 1,000 pixels change, then it should trigger an alarm
const SENSITIVITY_RATIO = 0.01;

// If Mean Brightness Changed > This Between Consecutive Frames => Sudden Light Change Like a Flash or Lamp
const SUDDEN_GLOBAL_BRIGHTNESS_THRESH = 30;

const CameraView: React.FC<CameraViewProps> = ({ onDetection, enabled }) => {
  // We need to use refs to persist values across renders and avoid unnecessary re-renders

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // background grayscale
  const bgRef = useRef<Uint8ClampedArray | null>(null);
  // previous frame grayscale
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null);
  // tell if the loop is running
  const runningRef = useRef(false);
  // requestAnimationFrame ID (we need it to cancel and stop it later)
  const rafRef = useRef<number | null>(null);
  // for controlling processing
  const lastProcessTimeRef = useRef(0);

  // timeout ID for the 3-second pause after detection
  const pauseTimeoutRef = useRef<number | null>(null);

  // small hidden canvas to capture 'before' frame when detection occurs
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  // getting stream and creating two canvases
  useEffect(() => {
    // getUserMedia and start stream
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        // Connect Video to DOM
        if (!mounted) return;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();

        // set canvas sizes when metadata available
        v.addEventListener("loadedmetadata", () => {
          // reads the video’s real width/height and set both canvases to size of the video (for processing)
          const w = v.videoWidth || 640;
          const h = v.videoHeight || 480;
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = w;
          canvas.height = h;

          // hidden capture canvas (for before frame and detection)
          const c2 = captureCanvasRef.current;
          if (!c2) return;
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
      setTimeout(() => {
        if (enabled) startProcessing();
      }, 5000);
    } else {
      stopProcessing();
    }
  }, [enabled]);

  // turn off the camera and detach it from the video element to free system resources
  const stopStream = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      const stream = v.srcObject as MediaStream;

      // get all media tracks (video and audio)
      const tracks = stream.getTracks();
      tracks.forEach((t) =>
        // stop capture from the device
        t.stop()
      );

      // detach the stream from the <video> element
      v.srcObject = null;
    }
  };

  const startProcessing = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    // saving current time as ms
    lastProcessTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopProcessing = () => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    // clear any pending pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  // now is sent by the browser and represents the time since the application started (invoke each frame)
  const loop = (now: number) => {
    if (!runningRef.current) return;

    // calculate the last time a frame was processed
    const elapsed = now - lastProcessTimeRef.current;
    // if enough time has passed, process the frame
    const interval = 1000 / PROCESS_FPS;
    if (elapsed >= interval) {
      processOnce();
      lastProcessTimeRef.current = now;
    }
    // at end of frame, request next animation frame
    rafRef.current = requestAnimationFrame(loop);
  };

  const processOnce = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    // draw current frame from video to canvas
    ctx.drawImage(video, 0, 0, w, h);
    // Getting array of pixels in rgba
    const frame = ctx.getImageData(0, 0, w, h);
    const currGray = getGrayFromImageData(frame);

    // compute mean brightness of current and previous frame (for sudden global changes) (turning on a flash or lamp)
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
      // EXPERIMENTAL (Using AI)
      const beforeDataUrl = captureFrameDataURL(
        prevGrayRef.current || currGray,
        w,
        h,
        captureCanvasRef.current
      );
      const afterDataUrl = captureFrameDataURL(
        currGray,
        w,
        h,
        captureCanvasRef.current
      );

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

      // pause processing for 3 seconds after detection
      stopProcessing();
      pauseTimeoutRef.current = setTimeout(() => {
        startProcessing();
      }, 3000);
    }

    // update background with running average: bg = (1-alpha)*bg + alpha*curr
    for (let i = 0; i < total; i++) {
      // simple running average
      bg[i] = Math.round((1 - ALPHA) * bg[i] + ALPHA * currGray[i]);
    }

    // set current gray as previous gray for next process
    prevGrayRef.current = currGray;
  };

  return (
    <section aria-label="Camera Canvas">
      <div>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-xl max-w-full rounded"
        />
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={captureCanvasRef} className="hidden" />
      </div>

      <div className="bg-bg/80 mt-4 rounded-lg border-2 border-gray-500 p-4">
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            <span
              className={`mr-2 h-2 w-2 rounded-full ${runningRef.current ? "bg-green-500" : "bg-red-500"}`}
            />
            Processing:{" "}
            <span
              className={`ml-1 ${runningRef.current ? "text-green-700" : "text-red-700"}`}
            >
              {runningRef.current ? "ON" : "OFF"}
            </span>
          </span>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-white">Parameters:</p>
          <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <li className="rounded border bg-white px-3 py-2 font-medium">
              FPS: {PROCESS_FPS}
            </li>
            <li className="rounded border bg-white px-3 py-2 font-medium">
              Pixel threshold: {PIXEL_DIFF_THRESHOLD}
            </li>
            <li className="rounded border bg-white px-3 py-2 font-medium">
              Sensitivity ratio: {SENSITIVITY_RATIO}
            </li>
            <li className="rounded border bg-white px-3 py-2 font-medium">
              Light threshold: {SUDDEN_GLOBAL_BRIGHTNESS_THRESH}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CameraView;
