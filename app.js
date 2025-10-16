// app.js

// DOM elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

// Get 2D context with willReadFrequently to avoid the console warning
// and improve readback performance when calling getImageData frequently.
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Processing parameters (tweak as needed)
const PROCESS_FPS = 15; // approximate processing rate (used for setTimeout interval)
const PIXEL_DIFF_THRESHOLD = 30; // per-pixel absolute difference threshold (0..255)
const SENSITIVITY_RATIO = 0.005; // fraction of pixels that must change to trigger alarm (e.g., 0.5%)

// state holders
let prevGray = null; // Uint8ClampedArray holding previous grayscale frame
let running = false;
let alarmed = false;

// start webcam
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Error accessing webcam:", err);
  }
}

// set canvas size when metadata is available
video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

// once video starts playing, start the processing loop
video.addEventListener("play", () => {
  running = true;
  alarmed = false;
  prevGray = null;
  // start processing loop
  processLoop();
});

// stop processing on pause/ended
video.addEventListener("pause", () => (running = false));
video.addEventListener("ended", () => (running = false));

// main processing loop
function processLoop() {
  if (!running || alarmed) return;
  const interval = 1000 / PROCESS_FPS;
  setTimeout(() => {
    processOnce();
    // schedule next run via requestAnimationFrame for smoother timing
    requestAnimationFrame(processLoop);
  }, interval);
}

// process a single frame: draw, convert to gray, compare with prev, decide
function processOnce() {
  const w = canvas.width,
    h = canvas.height;
  if (w === 0 || h === 0) return;

  // draw current video frame onto canvas
  ctx.drawImage(video, 0, 0, w, h);

  // read pixel data (RGBA)
  const frame = ctx.getImageData(0, 0, w, h);
  const data = frame.data; // Uint8ClampedArray length = w*h*4

  // convert to grayscale into a new array (one byte per pixel)
  const gray = new Uint8ClampedArray(w * h);
  let di = 0; // index in data (RGBA)
  for (let i = 0; i < gray.length; i++) {
    const r = data[di++];
    const g = data[di++];
    const b = data[di++];
    di++; // skip alpha
    // luminance formula
    const v = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray[i] = v;
  }

  // if we have a previous frame, compare
  if (prevGray) {
    let changed = 0;
    const total = gray.length;
    for (let i = 0; i < total; i++) {
      const d = Math.abs(gray[i] - prevGray[i]);
      if (d > PIXEL_DIFF_THRESHOLD) changed++;
    }
    const ratio = changed / total;

    // (optional) visual debug: draw difference map on canvas (commented out)
    // drawDebugDiff(gray, prevGray, w, h);

    // log status to console for now
    // console.log(`changed: ${changed}/${total} (${(ratio*100).toFixed(3)}%)`);

    if (ratio > SENSITIVITY_RATIO) {
      triggerAlarm({ changed, total, ratio });
      // stop further processing
      alarmed = true;
      running = false;
      // pause the video stream visually (optional)
      video.pause();
      return;
    }
  }

  // set current as previous for next iteration
  prevGray = gray;
}

// optional debug helper to visualize diff on canvas (not required)
// it paints red pixels where difference > PIXEL_DIFF_THRESHOLD
function drawDebugDiff(curr, prev, w, h) {
  const out = ctx.createImageData(w, h);
  let idx = 0;
  for (let i = 0; i < curr.length; i++) {
    const d = Math.abs(curr[i] - prev[i]);
    if (d > PIXEL_DIFF_THRESHOLD) {
      // red color for changed
      out.data[idx++] = 255; // R
      out.data[idx++] = 0; // G
      out.data[idx++] = 0; // B
      out.data[idx++] = 255; // A
    } else {
      // grayscale copy for unchanged
      out.data[idx++] = curr[i];
      out.data[idx++] = curr[i];
      out.data[idx++] = curr[i];
      out.data[idx++] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

// simple alarm trigger: play a tone and log
function triggerAlarm(info = {}) {
  console.log("ALARM TRIGGERED", info);
  // Play a short beep using Web Audio API
  try {
    const aCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = aCtx.createOscillator();
    const gain = aCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(aCtx.destination);
    gain.gain.value = 0.0001;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.2, aCtx.currentTime + 0.02);
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.0001, aCtx.currentTime + 0.1);
      osc.stop(aCtx.currentTime + 0.12);
    }, 700);
  } catch (e) {
    alert("ALARM!");
  }
}

// start everything
startCamera();
