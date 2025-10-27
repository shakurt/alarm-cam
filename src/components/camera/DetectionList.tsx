import type { Detection } from "@/types";
import type React from "react";

interface DetectionListProps {
  detections: Detection[];
}

const DetectionList: React.FC<DetectionListProps> = ({ detections }) => {
  return (
    <div className="max-h-96 overflow-auto rounded border-2 border-gray-500 p-2">
      <h3>Detections ({detections.length})</h3>
      {detections.map((item: Detection) => (
        <div key={item.id} className="flex gap-2 border-b border-gray-500 p-2">
          <div className="w-36">
            <div className="text-xs">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              {item.motion ? "Motion" : ""}{" "}
              {item.suddenLight ? " / Sudden light" : ""}
            </div>
            <div className="text-xs text-gray-400">
              ratio: {(item.ratio * 100).toFixed(2)}% meanDiff:{" "}
              {item.meanDiff.toFixed(1)}
            </div>
          </div>
          <div className="flex gap-6">
            <img
              src={item.before}
              alt="before"
              className="h-20 w-30 border border-gray-500 object-cover"
            />
            <img
              src={item.after}
              alt="after"
              className="h-20 w-30 border border-gray-500 object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetectionList;
