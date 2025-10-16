# Webcam Motion Detection System

A simple AI-based motion detection system using computer vision techniques. Built for educational purposes with vanilla JavaScript.

## Overview
This project demonstrates basic **computer vision** and **motion detection** algorithms using webcam input. The system analyzes video frames in real-time to detect movement and triggers an audio alarm.

## How It Works
1. **Frame Capture**: Gets video frames from webcam using HTML5 Canvas
2. **Grayscale Conversion**: Converts color frames to grayscale for processing
3. **Frame Comparison**: Compares current frame with previous frame pixel-by-pixel
4. **Motion Detection**: Counts changed pixels above threshold to detect motion
5. **Alarm Trigger**: Plays audio alert when motion exceeds sensitivity level

## Algorithm Details
- **Grayscale Formula**: `0.299*R + 0.587*G + 0.114*B`
- **Pixel Threshold**: 30 intensity units difference
- **Motion Sensitivity**: 0.5% of total pixels must change
- **Processing Rate**: ~15 FPS

## Usage
1. Clone the repository
2. Open `index.html` in your browser
3. Allow camera access
4. Move in front of camera to trigger alarm

## Files
- `index.html` - Main webpage
- `app.js` - Motion detection algorithm
- `style.css` - Basic styling

## AI/CV Concepts Demonstrated
- **Image Processing**: Pixel manipulation and grayscale conversion
- **Frame Differencing**: Basic motion detection technique
- **Threshold-based Detection**: Binary classification of motion/no-motion
- **Real-time Processing**: Live video stream analysis