import React, { useState, useEffect } from "react";
import CameraView from "@/components/camera/CameraView";
import DetectionList from "@/components/camera/DetectionList";

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [saveToStorage, setSaveToStorage] = useState(false);
  const [detections, setDetections] = useState(() => {
    // load from localStorage on start
    try {
      const raw = localStorage.getItem("alarmcam_detections");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // whenever detections change and saveToStorage is true, persist
  useEffect(() => {
    if (saveToStorage) {
      try {
        localStorage.setItem("alarmcam_detections", JSON.stringify(detections));
      } catch (e) {
        console.warn("Could not save detections:", e);
      }
    }
  }, [detections, saveToStorage]);

  function handleDetection(detection) {
    // add new detection at top
    setDetections((prev) => [detection, ...prev].slice(0, 200)); // cap to 200 items locally
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>alarm-cam (React)</h2>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />{" "}
            Enable detection (starts after 5s)
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={saveToStorage}
              onChange={(e) => setSaveToStorage(e.target.checked)}
            />{" "}
            Save detections to localStorage
          </label>

          <div style={{ marginTop: 12 }}>
            <CameraView
              onDetection={handleDetection}
              enabled={enabled}
              saveToStorage={saveToStorage}
            />
          </div>
        </div>

        <div style={{ width: 380 }}>
          <DetectionList detections={detections} />
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                setDetections([]);
                localStorage.removeItem("alarmcam_detections");
              }}
            >
              Clear list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
