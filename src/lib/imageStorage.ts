// IndexedDB client-side persistent storage for high-resolution timer background photos
// Handles large files (JPG, PNG, WebP) without LocalStorage quota issues

const DB_NAME = 'hungcube_photo_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const PHOTO_KEY = 'timer_background_photo';

export interface StoredPhoto {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveBackgroundPhoto(
  dataUrl: string,
  meta: { name: string; type: string; size: number }
): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record: StoredPhoto = {
        dataUrl,
        name: meta.name,
        type: meta.type,
        size: meta.size,
        timestamp: Date.now(),
      };

      const putRequest = store.put(record, PHOTO_KEY);

      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (error) {
    console.error('Failed to save background photo to IndexedDB:', error);
    return false;
  }
}

export async function getBackgroundPhoto(): Promise<StoredPhoto | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(PHOTO_KEY);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Failed to read background photo from IndexedDB:', error);
    return null;
  }
}

export async function deleteBackgroundPhoto(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const deleteRequest = store.delete(PHOTO_KEY);

      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  } catch (error) {
    console.error('Failed to delete background photo from IndexedDB:', error);
    return false;
  }
}
