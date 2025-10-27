// src/components/camera/Camera.tsx
import React, { useEffect, useRef, useState } from "react";
import CameraView from "@/components/camera/CameraView";
import DetectionList from "@/components/camera/DetectionList";
import type { Detection } from "@/types";
import Checkbox from "@/components/UI/Checkbox";
import Button from "@/components/UI/Button";

import {
  addDetectionToDB,
  getAllDetectionsFromDB,
  clearDetectionsInDB,
  type StoredDetection,
  exportAllDetections,
} from "@/utils/idb";

const Camera: React.FC = () => {
  const [enableRequested, setEnableRequested] = useState(false);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState<number | null>(null);

  const [saveToStorage, setSaveToStorage] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [resetBgSignal, setResetBgSignal] = useState<number>(0);
  const [resetCountdown, setResetCountdown] = useState<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const [includeImagesInExport, setIncludeImagesInExport] = useState(false);

  const [pauseRemainingMs, setPauseRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllDetectionsFromDB();
        setDetections(all.reverse());
      } catch (e) {
        console.warn("Could not load detections from IndexedDB:", e);
      }
    })();
  }, []);

  // start 5s countdown when user checks "enable"
  useEffect(() => {
    let timer: number | null = null;
    if (enableRequested) {
      setEnableCountdown(5);
      let remaining = 5;
      timer = window.setInterval(() => {
        remaining -= 1;
        setEnableCountdown(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          setIsAlarmEnabled(true);
          setEnableCountdown(null);
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
        }
      }, 1000);
    } else {
      setEnableCountdown(null);
      setIsAlarmEnabled(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enableRequested]);

  const handleDetection = async (detection: Detection) => {
    setDetections((prev) => [detection, ...prev].slice(0, 1000));
    if (saveToStorage) {
      try {
        const storeItem: StoredDetection = {
          id: detection.id,
          timestamp: detection.timestamp,
          suddenLight: detection.suddenLight,
          motion: detection.motion,
          ratio: detection.ratio,
          meanDiff: detection.meanDiff,
          before: detection.before,
          after: detection.after,
          background: detection.background ?? "",
          marked: detection.marked ?? "",
          bbox: detection.bbox,
        };
        await addDetectionToDB(storeItem);
      } catch (e) {
        console.warn("Failed to add detection to IndexedDB:", e);
      }
    }
  };

  const resetDetections = async () => {
    setDetections([]);
    try {
      await clearDetectionsInDB();
    } catch (e) {
      console.warn("Failed to clear IndexedDB:", e);
    }
  };

  const handleExport = async () => {
    try {
      const all = await exportAllDetections();
      const out = all.map((it) => {
        if (includeImagesInExport) return it;
        const { before, after, background, marked, ...rest } = it;
        return rest;
      });
      const blob = new Blob([JSON.stringify(out, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alarmcam_export_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Export failed:", e);
    }
  };

  // reset background with 5s countdown
  const triggerResetBackground = () => {
    if (resetCountdown !== null) return;
    setResetCountdown(5);
    let remaining = 5;
    resetTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setResetCountdown(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        setResetBgSignal((s) => s + 1);
        setResetCountdown(null);
        if (resetTimerRef.current) {
          clearInterval(resetTimerRef.current);
          resetTimerRef.current = null;
        }
      }
    }, 1000);
  };

  const handlePauseChange = (paused: boolean, remainingMs?: number) => {
    if (!paused) setPauseRemainingMs(null);
    else setPauseRemainingMs(remainingMs ?? null);
  };

  return (
    <section style={{ padding: 12 }}>
      <h2>alarm-cam</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          <input
            type="checkbox"
            checked={enableRequested}
            onChange={(e) => setEnableRequested(e.target.checked)}
          />{" "}
          Enable detection (starts after 5s)
        </label>
        {enableCountdown !== null && <div>Starting in: {enableCountdown}s</div>}

        <label>
          <input
            type="checkbox"
            checked={saveToStorage}
            onChange={(e) => setSaveToStorage(e.target.checked)}
          />{" "}
          Save detections to storage (IndexedDB)
        </label>

        <button onClick={triggerResetBackground}>Reset Background (5s)</button>
        {resetCountdown !== null && <div>Reset in: {resetCountdown}s</div>}

        <label>
          <input
            type="checkbox"
            checked={includeImagesInExport}
            onChange={(e) => setIncludeImagesInExport(e.target.checked)}
          />{" "}
          Include images in export
        </label>

        <button onClick={handleExport}>Export All (IndexedDB → JSON)</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <CameraView
          onDetection={handleDetection}
          enabled={isAlarmEnabled}
          resetBgSignal={resetBgSignal}
          onPauseChange={handlePauseChange}
          saveToStorage={saveToStorage}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {pauseRemainingMs !== null && (
          <div>
            Paused after detection — remaining:{" "}
            {Math.ceil((pauseRemainingMs ?? 0) / 1000)}s
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <DetectionList detections={detections} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={resetDetections} disabled={!detections.length}>
          Clear List
        </button>
      </div>
    </section>
  );
};

export default Camera;
