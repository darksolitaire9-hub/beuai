// app/composables/useReceiptStorage.ts | Composable | History context
// Wraps IndexedDB for durable SavedReceipt persistence.
// Opens a versioned IDBDatabase once per session; exposes loadAll, persist, drop.
// Needs: SavedReceipt from ~/types/receipt

import type { SavedReceipt } from "../types/receipt";

const DB_NAME = "bewai-db";
const DB_VERSION = 1;
const STORE_NAME = "receipts";

let _db: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!import.meta.client) {
    return Promise.reject(
      new Error("[storage] IndexedDB not available on server"),
    );
  }
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        indexedDB.deleteDatabase(DB_NAME);
        _db = null;
        reject(
          new Error(`[storage] ${STORE_NAME} store missing — database reset`),
        );
        return;
      }
      _db = db;
      resolve(db);
    };

    req.onerror = (e) =>
      reject(
        (e.target as IDBOpenDBRequest).error ??
          new Error("[storage] database open failed"),
      );
  });
}

export const useReceiptStorage = () => {
  const loadAll = async (): Promise<SavedReceipt[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result as SavedReceipt[]);
      req.onerror = () =>
        reject(req.error ?? new Error("[storage] request failed"));
      tx.onabort = () =>
        reject(tx.error ?? new Error("[storage] transaction aborted"));
    });
  };

  const persist = async (receipt: SavedReceipt): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(receipt);
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("[storage] transaction failed"));
      tx.onabort = () =>
        reject(tx.error ?? new Error("[storage] transaction aborted"));
    });
  };

  const drop = async (id: string): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("[storage] transaction failed"));
      tx.onabort = () =>
        reject(tx.error ?? new Error("[storage] transaction aborted"));
    });
  };

  return { loadAll, persist, drop };
};
