import type { Detection } from "@/types";

import Chip from "../UI/Chip";

interface Props {
  detections: Detection[];
}

const DetectionList: React.FC<Props> = ({ detections }) => {
  return (
    <div className="max-h-[420px] overflow-y-auto border border-gray-300 p-2">
      <h3 className="text-center">Detections ({detections.length})</h3>
      {detections.length > 0 && <hr className="my-2" />}
      {detections.map((detection) => (
        <div
          key={detection.id}
          className="flex flex-col gap-3 border-b border-gray-300 p-2 md:flex-row"
        >
          <div className="w-full md:max-w-[200px] md:min-w-[200px]">
            <span className="block text-center text-sm md:text-start">
              {new Date(detection.timestamp).toLocaleString()}
            </span>
            <div className="mt-2 flex flex-wrap gap-x-2 gap-y-2 text-sm text-gray-400">
              {detection.motion && <Chip>Motion</Chip>}
              {detection.suddenLight && <Chip>Sudden light</Chip>}
              <Chip>ratio: {(detection.ratio * 100).toFixed(2)}%</Chip>
              <Chip>meanDiff: {detection.meanDiff.toFixed(1)}</Chip>
              {detection.bbox && (
                <>
                  <Chip>x: {detection.bbox.x}</Chip>
                  <Chip>y: {detection.bbox.y}</Chip>
                  <Chip>w: {detection.bbox.w}</Chip>
                  <Chip>h: {detection.bbox.h}</Chip>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-1 md:justify-center">
            <img
              src={detection.before}
              alt="before"
              className="h-[90px] w-full border border-gray-300 object-cover md:w-[120px]"
            />
            <img
              src={detection.after}
              alt="after"
              className="h-[90px] w-full border border-gray-300 object-cover md:w-[120px]"
            />
            <img
              src={detection.background}
              alt="background"
              className="h-[90px] w-full border border-gray-300 object-cover md:w-[120px]"
            />
            <img
              src={detection.marked ?? detection.after}
              alt="marked"
              className="h-[90px] w-full object-cover md:w-[120px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetectionList;
