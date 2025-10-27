// src/utils/idb.ts
export type StoredDetection = {
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

const DB_NAME = "alarmcam_db_v1";
const STORE_NAME = "detections";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addDetectionToDB(item: StoredDetection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const r = store.put(item);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

export async function getAllDetectionsFromDB(): Promise<StoredDetection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as StoredDetection[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearDetectionsInDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function exportAllDetections(): Promise<StoredDetection[]> {
  return getAllDetectionsFromDB();
}
