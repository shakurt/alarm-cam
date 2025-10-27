export type UserInfo = {
  email: string;
  sendEmail: boolean;
  // alarmcam_detections: Detection[];
};

export interface Detection {
  id: number;
  timestamp: string;
  suddenLight: boolean;
  motion: boolean;
  ratio: number;
  meanDiff: number;
  before: string;
  after: string;
}

export interface CameraViewProps {
  onDetection: (detection: Detection) => void;
  enabled: boolean;
  saveToStorage: boolean;
}

export interface DetectionListProps {
  detections: Detection[];
}
