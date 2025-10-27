// src/components/camera/DetectionList.tsx
import React from "react";
import type { Detection } from "@/types";

interface Props {
  detections: Detection[];
}

const DetectionList: React.FC<Props> = ({ detections }) => {
  return (
    <div
      style={{
        maxHeight: 420,
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: 8,
      }}
    >
      <h3>Detections ({detections.length})</h3>
      {detections.map((d) => (
        <div
          key={d.id}
          style={{
            display: "flex",
            gap: 12,
            padding: 8,
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 12 }}>
              {new Date(d.timestamp).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {d.motion ? "Motion" : ""}{" "}
              {d.suddenLight ? " / Sudden light" : ""}
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>
              ratio: {(d.ratio * 100).toFixed(2)}% meanDiff:{" "}
              {d.meanDiff.toFixed(1)}
            </div>
            {d.bbox && (
              <div style={{ fontSize: 11, color: "#999" }}>
                area: x:{d.bbox.x} y:{d.bbox.y} w:{d.bbox.w} h:{d.bbox.h}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <img
              src={d.before}
              alt="before"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
            <img
              src={d.after}
              alt="after"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
            <img
              src={d.background}
              alt="background"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
            <img
              src={d.marked ?? d.after}
              alt="marked"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "2px solid #f55",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetectionList;
