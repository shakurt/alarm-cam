# Alarm Camera - Real-time Motion Detection System

An advanced browser-based motion detection application built with React, TypeScript, and sophisticated computer vision algorithms. Transform your device's camera into an intelligent security monitor with real-time processing and smart detection capabilities.

## 🚀 Features

### Core Motion Detection

- **Real-time Processing**: Analyzes video frames at 10 FPS with minimal latency
- **Advanced Background Modeling**: Uses exponential moving average to learn and adapt to environmental changes
- **Adaptive Thresholding**: Dynamically adjusts sensitivity based on current conditions
- **Multi-frame Confirmation**: Requires consecutive motion frames to reduce false positives
- **Sudden Light Detection**: Specialized detection for rapid lighting changes
- **Smart Pause System**: Prevents alert spam with configurable pause periods

### Intelligent Features

- **Bounding Box Detection**: Identifies and highlights exact motion areas
- **Four-Image capture**: Before, after, background reference, and zoomed detection area
- **Audio Alerts**: Customizable beep notifications using Web Audio API
- **Background Reset**: Manual and automatic background recalibration
- **Detection Statistics**: Detailed metrics including change ratios and brightness differences

### Data Management

- **Local Storage**: Uses IndexedDB for offline detection history
- **Export Functionality**: Download detection data as JSON for analysis
- **User Preferences**: Persistent login and notification settings
- **Real-time Statistics**: Live display of processing parameters and detection counts

### User Experience

- **Responsive Design**: Works on desktop and mobile devices
- **Toast Notifications**: Real-time status updates and countdown timers
- **Processing Indicators**: Visual feedback for system status
- **Clean Interface**: Modern UI with Tailwind CSS styling

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Image Processing**: HTML5 Canvas API
- **Camera Access**: WebRTC MediaDevices API
- **Storage**: IndexedDB for client-side persistence
- **Audio**: Web Audio API for alert sounds
- **Build Tool**: Vite with hot module replacement
- **Code Quality**: ESLint + Prettier with strict TypeScript

## 📊 Processing Parameters

| Parameter           | Value  | Description                                 |
| ------------------- | ------ | ------------------------------------------- |
| Frame Rate          | 10 FPS | Processing frequency for motion analysis    |
| Background Alpha    | 0.02   | Learning rate for background adaptation     |
| EMA Alpha           | 0.05   | Exponential moving average smoothing factor |
| Sensitivity Factor  | 1.8    | Motion detection sensitivity multiplier     |
| Confirmation Frames | 2      | Required consecutive motion frames          |
| Pause Duration      | 3000ms | Post-detection pause to prevent spam        |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser with camera access
- HTTPS connection (required for camera access)

### Installation

```bash
# Clone the repository
git clone https://github.com/shakurt/alarm-cam.git
cd alarm-cam

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint checks
npm run lint:fix     # Fix linting issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🔧 Configuration

### Environment Setup

The application runs entirely in the browser with no backend requirements. Key configurations:

- **Camera Resolution**: Automatically adapts to device capabilities
- **Processing Rate**: Configurable via `PROCESS_FPS` constant
- **Detection Sensitivity**: Adjustable through various algorithm parameters
- **Storage Limits**: Maximum 1000 detections in memory

### Algorithm Tuning

Key parameters can be adjusted in `src/components/camera/CameraView.tsx`:

```typescript
const PROCESS_FPS = 10; // Processing frequency
const ALPHA_BG = 0.02; // Background learning rate
const EMA_ALPHA = 0.05; // Moving average smoothing
const SENSITIVITY_FACTOR = 1.8; // Detection sensitivity
const PAUSE_AFTER_DETECTION_MS = 3000; // Post-detection pause
const MOTION_CONFIRM_FRAMES = 2; // Confirmation requirement
```

## 🏗️ Architecture

### Core Components

- **CameraView**: Main detection engine with video processing
- **DetectionList**: Display and management of detection history
- **Camera**: Parent component coordinating detection flow
- **Frame Utils**: Image processing and computer vision algorithms

### Key Algorithms

1. **Grayscale Conversion**: RGB to luminance using standard coefficients
2. **Background Subtraction**: Pixel-wise difference with adaptive background
3. **Binary Thresholding**: Adaptive threshold based on environmental analysis
4. **Morphological Operations**: Noise reduction and region enhancement
5. **Bounding Box Calculation**: Precise motion area identification

### Data Flow

```
Video Stream → Frame Capture → Grayscale → Background Subtraction →
Thresholding → Motion Analysis → Detection Decision → Alert & Storage
```

## 🎯 Use Cases

- **Home Security**: Monitor entrances, rooms, or outdoor areas
- **Office Surveillance**: Track after-hours activity or unauthorized access
- **Pet Monitoring**: Keep track of pet behavior and activity
- **Research**: Computer vision algorithm testing and development
- **Education**: Demonstrate motion detection concepts and techniques

## 🔒 Privacy & Security

- **Local Processing**: All video analysis happens in your browser
- **No Cloud Upload**: Video streams never leave your device
- **Local Storage**: Detection data stored locally in IndexedDB
- **User Control**: Complete control over when detection is active

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines

- Follow TypeScript strict mode requirements
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test thoroughly across different devices and browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Developed by **ThePrimeShak** - [GitHub Profile](https://github.com/shakurt)

---

_Transform your browser into a powerful motion detection system with Alarm Camera!_
