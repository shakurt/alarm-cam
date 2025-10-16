const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Start webcam
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.error("Error accessing webcam:", err);
  });

// Process each frame
function processFrame() {
  // Draw the current video frame onto the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get pixel data from the canvas
  let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = frame.data;

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]; // Red
    let g = data[i + 1]; // Green
    let b = data[i + 2]; // Blue

    // Convert RGB to grayscale using luminance formula
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Set all channels to the same gray value
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Put the modified frame back to the canvas
  ctx.putImageData(frame, 0, 0);

  // Repeat for the next frame
  requestAnimationFrame(processFrame);
}

// Start processing loop
video.addEventListener("play", () => {
  requestAnimationFrame(processFrame);
});
