import { useState, useEffect } from "react";

import CameraView from "@/components/camera/CameraView";
import DetectionList from "@/components/camera/DetectionList";
import type { Detection } from "@/types";
import Checkbox from "@/components/UI/Checkbox";
import Button from "@/components/UI/Button";

const Camera = () => {
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [saveToStorage, setSaveToStorage] = useState(false);
  const [detections, setDetections] = useState<Detection[]>(() => {
    // Getting all detections from localStorage at startup
    try {
      const raw = localStorage.getItem("alarmcam_detections");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Whenever detections change and saveToStorage is true, save data to localStorage
  useEffect(() => {
    if (saveToStorage) {
      try {
        localStorage.setItem("alarmcam_detections", JSON.stringify(detections));
      } catch (e) {
        console.warn("Could not save detections:", e);
      }
    }
  }, [detections, saveToStorage]);

  const handleDetection = (detection: Detection) => {
    // add new detection at top
    setDetections((prev: Detection[]) => [detection, ...prev].slice(0, 200)); // cap to 200 items locally
  };

  const resetDetections = () => {
    setDetections([]);
    localStorage.removeItem("alarmcam_detections");
  };

  return (
    <section className="d-flex container my-5 max-w-xl gap-3">
      <div className="sm:flex sm:items-center sm:justify-between">
        <Checkbox
          label="Enable detection (starts after 5s)"
          name="enable-detection"
          checked={isAlarmEnabled}
          onChange={setIsAlarmEnabled}
        />

        <Checkbox
          label="Save detections to localStorage"
          name="save-detections"
          checked={saveToStorage}
          onChange={setSaveToStorage}
        />
      </div>

      <div className="mt-5 flex items-center justify-center">
        <CameraView
          onDetection={handleDetection}
          enabled={isAlarmEnabled}
          saveToStorage={saveToStorage}
        />
      </div>

      <section aria-label="Detection List" className="mt-5">
        <DetectionList detections={detections} />

        <Button
          className="bg-secondary disabled:bg-secondary mt-2"
          type="button"
          onClick={resetDetections}
          disabled={!detections.length}
        >
          Clear List
        </Button>
      </section>
    </section>
  );
};

export default Camera;
