import React, { useEffect, useRef, useState } from "react";

import CameraView from "@/components/camera/CameraView";
import DetectionList from "@/components/camera/DetectionList";
import Button from "@/components/UI/Button";
import Checkbox from "@/components/UI/Checkbox";
import type { Detection } from "@/types";
import {
  addDetectionToDB,
  getAllDetectionsFromDB,
  clearDetectionsInDB,
  type StoredDetection,
  exportAllDetections,
} from "@/utils/idb";
import { startToastTimer } from "@/utils/toast-timer";

const ENABLE_COUNTDOWN_SECONDS = 5;
const RESET_BG_COUNTDOWN_SECONDS = 5;
const MAX_DETECTIONS_IN_MEMORY = 1000;

const Camera: React.FC = () => {
  const [enableRequested, setEnableRequested] = useState(false);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);

  const [saveToStorage, setSaveToStorage] = useState(false);
  const [loadingResetBtn, setLoadingResetBtn] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Background reset state
  const [resetBgSignal, setResetBgSignal] = useState(0);
  const pauseToastShownRef = useRef(false);

  useEffect(() => {
    loadDetections();
  }, []);

  const loadDetections = async () => {
    try {
      const all = await getAllDetectionsFromDB();
      setDetections(all.reverse());
    } catch (error) {
      console.warn("Could not load detections from IndexedDB:", error);
    }
  };

  const handleDetection = async (detection: Detection) => {
    // Add to local state
    setDetections((prev) =>
      [detection, ...prev].slice(0, MAX_DETECTIONS_IN_MEMORY)
    );

    // Save to IndexedDB if enabled
    if (saveToStorage) {
      try {
        await addDetectionToDB({
          ...detection,
          background: detection.background ?? "",
          marked: detection.marked ?? "",
        } as StoredDetection);
      } catch (error) {
        console.warn("Failed to add detection to IndexedDB:", error);
      }
    }
  };

  const resetDetections = async () => {
    setLoadingResetBtn(true);
    setDetections([]);
    try {
      await clearDetectionsInDB();
    } catch (error) {
      console.warn("Failed to clear IndexedDB:", error);
    } finally {
      setLoadingResetBtn(false);
    }
  };

  const handleExport = async () => {
    try {
      const all = await exportAllDetections();
      const data = all.map(
        ({
          before: _before,
          after: _after,
          background: _background,
          marked: _marked,
          ...rest
        }) => rest
      );

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `alarmcam_export_${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Export failed:", error);
    }
  };

  function triggerResetBackground() {
    const { taskPromise } = startToastTimer(
      RESET_BG_COUNTDOWN_SECONDS * 1000,
      "Background resetting in"
    );
    taskPromise.then(() => setResetBgSignal((prev) => prev + 1));
  }

  function handlePauseChange(paused: boolean, remainingMs?: number) {
    if (paused && remainingMs && !pauseToastShownRef.current) {
      pauseToastShownRef.current = true;
      startToastTimer(remainingMs, "Detection paused, resuming in");
    } else if (!paused) {
      pauseToastShownRef.current = false;
    }
  }

  const handleToggleDetection = (isChecked: boolean) => {
    setEnableRequested(isChecked);

    if (isChecked) {
      const { taskPromise } = startToastTimer(
        ENABLE_COUNTDOWN_SECONDS * 1000,
        "Detection enabling in"
      );
      taskPromise.then(() => setIsAlarmEnabled(true));
    } else setIsAlarmEnabled(false);
  };

  return (
    <>
      <section className="mx-auto my-5 max-w-4xl p-5">
        <div className="mb-5 flex justify-between">
          <Checkbox
            className="font-medium"
            label="Enable Detection"
            name="enable-detection"
            checked={enableRequested}
            onChange={(isChecked) => handleToggleDetection(isChecked)}
          />

          <Checkbox
            className="font-medium"
            label="Save detections to storage"
            name="save-detections"
            checked={saveToStorage}
            onChange={(isChecked) => setSaveToStorage(isChecked)}
          />
        </div>

        <CameraView
          onDetection={handleDetection}
          enabled={isAlarmEnabled}
          resetBgSignal={resetBgSignal}
          onPauseChange={handlePauseChange}
          saveToStorage={saveToStorage}
          triggerResetBackground={triggerResetBackground}
        />

        <div aria-label="Buttons of Detect Section" className="mt-5">
          <DetectionList detections={detections} />
          <div className="mt-2 flex items-center justify-between gap-5">
            <Button
              type="button"
              onClick={resetDetections}
              disabled={!detections.length}
              className="bg-secondary hover:bg-secondary/80"
              loading={loadingResetBtn}
            >
              Clear List
            </Button>

            <Button
              type="button"
              onClick={handleExport}
              disabled={!detections.length}
            >
              Export All
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Camera;
