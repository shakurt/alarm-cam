export type UserInfo = {
  email: string;
  sendEmail: boolean;
  // alarmcam_detections: Detection[];
};

export type Detection = {
  id: number;
  timestamp: string;
  suddenLight: boolean;
  motion: boolean;
  ratio: number;
  meanDiff: number;
  before: string;
  after: string;
  background: string;
  marked?: string;
  bbox?: { x: number; y: number; w: number; h: number };
};

export interface CameraViewProps {
  onDetection: (detection: Detection) => void;
  enabled: boolean;
  saveToStorage: boolean;
}

export interface DetectionListProps {
  detections: Detection[];
}
