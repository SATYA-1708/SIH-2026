/**
 * Offline-First IndexedDB & Storage Engine with Idempotent Operation IDs
 * 
 * Stores lots and photos created offline into client-side storage,
 * assigns unique operation_ids (OP-XXXX) to guarantee idempotency,
 * and synchronizes with /api/sync when connection is restored.
 */

export interface OfflineLot {
  localId: string;
  operationId: string; // Idempotent key: OP-YYYYMMDD-RANDOM
  materialCategory: string;
  materialDescription?: string;
  imageReference?: string;
  imageBlobKey?: string;
  approximateWeight: number;
  condition: string;
  collectionLocation: string;
  latitude?: number;
  longitude?: number;
  selectedRecyclerId?: string;
  createdAt: string;
  syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  estimatedValue?: number;
}

const STORAGE_KEY = 'ewaste_offline_queue_v2';
const CACHED_PRICES_KEY = 'ewaste_cached_prices';
const CACHED_RECYCLERS_KEY = 'ewaste_cached_recyclers';
const DB_NAME = 'EwasteSetuOfflineDB';
const DB_VERSION = 1;

/**
 * Open or initialize IndexedDB store for structured offline persistence
 */
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this browser'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('lots')) {
        db.createObjectStore('lots', { keyPath: 'localId' });
      }
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'operationId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function generateOperationId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OP-${dateStr}-${rand}`;
}

export function getOfflineQueue(): OfflineLot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToOfflineQueue(
  lot: Omit<OfflineLot, 'localId' | 'operationId' | 'createdAt' | 'syncStatus'>
): OfflineLot {
  const queue = getOfflineQueue();
  const operationId = generateOperationId();
  const newLot: OfflineLot = {
    ...lot,
    localId: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    operationId,
    createdAt: new Date().toISOString(),
    syncStatus: 'PENDING_SYNC',
  };

  queue.unshift(newLot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

  // Asynchronously also mirror into IndexedDB for persistent survival
  openIndexedDB()
    .then(db => {
      const tx = db.transaction('lots', 'readwrite');
      tx.objectStore('lots').put(newLot);
    })
    .catch(() => {});

  window.dispatchEvent(new CustomEvent('ewaste:queue-changed', { detail: { count: queue.length } }));
  return newLot;
}

export function clearSyncedFromQueue(syncedOperationIds: string[]) {
  const queue = getOfflineQueue();
  const remaining = queue.filter(
    item => !syncedOperationIds.includes(item.operationId) && !syncedOperationIds.includes(item.localId)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

  openIndexedDB()
    .then(db => {
      const tx = db.transaction('lots', 'readwrite');
      const store = tx.objectStore('lots');
      syncedOperationIds.forEach(id => store.delete(id));
    })
    .catch(() => {});

  window.dispatchEvent(new CustomEvent('ewaste:queue-changed', { detail: { count: remaining.length } }));
}

export function cachePrices(prices: any[]) {
  try {
    localStorage.setItem(CACHED_PRICES_KEY, JSON.stringify({ data: prices, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Failed to cache prices offline', e);
  }
}

export function getCachedPrices(): any[] | null {
  try {
    const raw = localStorage.getItem(CACHED_PRICES_KEY);
    return raw ? JSON.parse(raw).data : null;
  } catch {
    return null;
  }
}

export function cacheRecyclers(recyclers: any[]) {
  try {
    localStorage.setItem(CACHED_RECYCLERS_KEY, JSON.stringify({ data: recyclers, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Failed to cache recyclers offline', e);
  }
}

export function getCachedRecyclers(): any[] | null {
  try {
    const raw = localStorage.getItem(CACHED_RECYCLERS_KEY);
    return raw ? JSON.parse(raw).data : null;
  } catch {
    return null;
  }
}

/**
 * Idempotent synchronization engine with server ACK
 */
export async function syncOfflineQueue(collectorId?: string): Promise<{ syncedCount: number; errors: any[] }> {
  const queue = getOfflineQueue();
  const pending = queue.filter(item => item.syncStatus === 'PENDING_SYNC');

  if (pending.length === 0) {
    return { syncedCount: 0, errors: [] };
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: pending, collectorId }),
    });

    if (!res.ok) {
      throw new Error(`Sync failed with status: ${res.status}`);
    }

    const data = await res.json();
    const successfulOperationIds = (data.results || [])
      .filter((r: any) => r.status === 'SYNCED')
      .map((r: any) => r.operationId || r.localId);

    clearSyncedFromQueue(successfulOperationIds);
    return {
      syncedCount: successfulOperationIds.length,
      errors: (data.results || []).filter((r: any) => r.status !== 'SYNCED'),
    };
  } catch (error) {
    console.error('Offline sync failed (will retry automatically on next connectivity):', error);
    return { syncedCount: 0, errors: [error] };
  }
}
