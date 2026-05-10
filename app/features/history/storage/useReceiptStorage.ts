// app/composables/useReceiptStorage.ts | Composable | History context
// Wraps IndexedDB for durable SavedReceipt persistence.
// Opens a versioned IDBDatabase once per session; exposes loadAll, persist, drop.
// Needs: SavedReceipt from ~/types/receipt

import type { SavedReceipt } from "../types/receipt";

const DB_NAME = "bewai-db";
const DB_VERSION = 2; // Incremented version to add index
const STORE_NAME = "receipts";

let _db: IDBDatabase | null = null;

export const generateReceiptSignature = (receipt: {
  vendor_tax_id: string | null;
  date: string | null;
  total_paid: number | null;
}): string => {
  const parts = [
    receipt.vendor_tax_id ?? "unknown-vendor",
    receipt.date ?? "unknown-date",
    receipt.total_paid?.toFixed(2) ?? "0.00",
  ];
  return parts.join("|");
};

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
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        store = (e.target as IDBOpenDBRequest).transaction!.objectStore(
          STORE_NAME,
        );
      }
      if (!store.indexNames.contains("signature")) {
        store.createIndex("signature", "signature", { unique: false });
      }
    };

    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
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
    });
  };

  const isDuplicate = async (signature: string): Promise<boolean> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("signature");
      const req = index.getKey(signature);

      req.onsuccess = () => resolve(req.result !== undefined);
      req.onerror = () =>
        reject(req.error ?? new Error("[storage] duplicate check failed"));
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
    });
  };

  return { loadAll, isDuplicate, persist, drop };
};
