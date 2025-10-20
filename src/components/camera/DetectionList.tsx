import React from "react";

/*
 DetectionList
 - receives an array of detection objects
 - shows timestamp, tags (motion / sudden light), and before/after thumbnails
*/

export default function DetectionList({ detections }) {
  return (
    <div
      style={{
        maxHeight: 400,
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: 8,
      }}
    >
      <h3>Detections ({detections.length})</h3>
      {detections.map((item) => (
        <div
          key={item.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: 6,
            display: "flex",
            gap: 8,
          }}
        >
          <div style={{ width: 140 }}>
            <div style={{ fontSize: 12 }}>
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {item.motion ? "Motion" : ""}{" "}
              {item.suddenLight ? " / Sudden light" : ""}
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>
              ratio: {(item.ratio * 100).toFixed(2)}% meanDiff:{" "}
              {item.meanDiff.toFixed(1)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <img
              src={item.before}
              alt="before"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
            <img
              src={item.after}
              alt="after"
              style={{
                width: 120,
                height: 90,
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
