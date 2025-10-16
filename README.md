# alarm-cam

A lightweight browser-based motion detection system that uses your webcam to trigger an alarm when movement is detected.  
Built with **vanilla JavaScript**, HTML, and CSS — no external libraries required.

---

## 🚀 Features
- **Real-time video capture** from your webcam  
- **Grayscale conversion** for efficient frame comparison
- **Pixel-by-pixel motion detection** with configurable sensitivity
- **Audio alarm** with Web Audio API (sine wave beep)
- **Optimized canvas rendering** with `willReadFrequently` context
- **Automatic processing pause** after alarm trigger
- Lightweight and runs fully in the **browser**

---

## 📂 Project Structure
```
alarm-cam/
│
├── index.html    # Main HTML page
├── style.css     # Styling for UI  
├── app.js        # Core logic (video capture, processing, motion detection)
└── README.md     # Project description
```

---

## 🛠️ How It Works
1. **Video Capture**: Uses `getUserMedia()` to access webcam stream
2. **Canvas Processing**: Draws video frames onto HTML5 canvas at ~15 FPS
3. **Grayscale Conversion**: Converts RGBA pixels to grayscale using luminance formula: `0.299*R + 0.587*G + 0.114*B`
4. **Motion Detection**: Compares current frame with previous frame pixel-by-pixel
5. **Threshold Analysis**: Triggers alarm when >0.5% of pixels change by >30 intensity units
6. **Audio Alarm**: Plays 880Hz sine wave beep using Web Audio API
7. **Auto-pause**: Stops processing and pauses video after alarm

---

## ⚙️ Configuration
You can adjust these parameters in `app.js`:

```javascript
const PROCESS_FPS = 15;              // Processing frame rate
const PIXEL_DIFF_THRESHOLD = 30;     // Pixel change threshold (0-255)
const SENSITIVITY_RATIO = 0.005;     // Motion sensitivity (0.5% of pixels)
```

---

## 📦 Installation & Usage

### Method 1: Local File
1. Clone this repository:
   ```bash
   git clone https://github.com/shakurt/alarm-cam.git
   cd alarm-cam
   ```
2. Open `index.html` in your browser
3. Allow camera access when prompted
4. Move in front of your webcam → alarm triggers

### Method 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

---

## 🔧 Technical Details
- **Canvas Context**: Uses `willReadFrequently: true` for optimized `getImageData()` calls
- **Memory Management**: Reuses `Uint8ClampedArray` for grayscale conversion
- **Processing Loop**: Combines `setTimeout` and `requestAnimationFrame` for smooth performance
- **Error Handling**: Graceful fallback to alert if Web Audio API fails
- **Stream Management**: Properly handles video events (play/pause/ended)

---

## 🔮 Future Improvements
- ✅ ~~Add audio alarm (beep sound)~~ - **Implemented**
- [ ] Motion detection zones (ignore specific areas)
- [ ] Sensitivity adjustment UI controls  
- [ ] Motion event logging with timestamps
- [ ] Email/SMS notifications
- [ ] Advanced algorithms (optical flow, background subtraction)
- [ ] Mobile app deployment (PWA)
- [ ] Multi-camera support

---

## 🐛 Troubleshooting
- **No camera access**: Ensure HTTPS or localhost for `getUserMedia()`
- **Performance issues**: Reduce `PROCESS_FPS` or increase `PIXEL_DIFF_THRESHOLD`
- **False alarms**: Increase `SENSITIVITY_RATIO` or `PIXEL_DIFF_THRESHOLD`
- **No audio**: Check browser audio permissions and volume

---

## 📄 License
MIT License – free to use and modify.