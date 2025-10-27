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
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addDetectionToDB(item: StoredDetection): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDetectionsFromDB(): Promise<StoredDetection[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as StoredDetection[]);
    request.onerror = () => reject(request.error);
  });
}

export async function clearDetectionsInDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportAllDetections(): Promise<StoredDetection[]> {
  return getAllDetectionsFromDB();
}
