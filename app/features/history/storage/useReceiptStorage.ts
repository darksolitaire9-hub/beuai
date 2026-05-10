// app/composables/useReceiptStorage.ts | Composable | History context
// Wraps IndexedDB for durable SavedReceipt persistence.
// Opens a versioned IDBDatabase once per session; exposes loadAll, persist, drop.
// Needs: SavedReceipt from ~/types/receipt

import type { SavedReceipt } from "../types/receipt";

const DB_NAME = "bewai-db";
const DB_VERSION = 3; // Incremented version to add queue store
const STORE_NAME = "receipts";
const QUEUE_STORE = "queue";

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
      
      // Receipts Store
      let receiptStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        receiptStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        receiptStore = (e.target as IDBOpenDBRequest).transaction!.objectStore(STORE_NAME);
      }
      if (!receiptStore.indexNames.contains("signature")) {
        receiptStore.createIndex("signature", "signature", { unique: false });
      }

      // Queue Store
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
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
        reject(req.error ?? new Error("[storage] loadAll failed"));
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
      // JSON stringify/parse is the safest way to strip Vue proxies for IDB
      tx.objectStore(STORE_NAME).put(JSON.parse(JSON.stringify(receipt)));
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("[storage] persist failed"));
    });
  };

  const drop = async (id: string): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("[storage] drop failed"));
    });
  };

  // Queue Operations (Persistent part of the Hybrid Queue)
  const loadQueue = async (): Promise<any[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readonly");
      const req = tx.objectStore(QUEUE_STORE).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("[storage] loadQueue failed"));
    });
  };

  const persistQueueItem = async (item: any): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      
      // Construct a plain object, stripping proxies but preserving data
      // Note: We do NOT persist the File object (volatile RAM only)
      const persistentItem = {
        id: item.id,
        status: item.status,
        result: item.result ? JSON.parse(JSON.stringify(item.result)) : null,
        error: item.error
      };

      tx.objectStore(QUEUE_STORE).put(persistentItem);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("[storage] persistQueueItem failed"));
    });
  };

  const dropQueueItem = async (id: string): Promise<void> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      tx.objectStore(QUEUE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("[storage] dropQueueItem failed"));
    });
  };

  return { loadAll, isDuplicate, persist, drop, loadQueue, persistQueueItem, dropQueueItem };
};
