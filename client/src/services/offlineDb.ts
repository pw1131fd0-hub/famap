import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Location } from '../types';

const DB_NAME = 'famap-offline';
const DB_VERSION = 1;
const LOCATIONS_STORE = 'locations';
const META_STORE = 'meta';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FamMapDB extends DBSchema {
  locations: {
    key: string;
    value: Location;
    indexes: { by_category: string };
  };
  meta: {
    key: string;
    value: {
      key: string;
      fetchedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FamMapDB>> | null = null;

function getDb(): Promise<IDBPDatabase<FamMapDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FamMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
          const store = db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id' });
          store.createIndex('by_category', 'category');
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveLocations(cacheKey: string, locations: Location[]): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction([LOCATIONS_STORE, META_STORE], 'readwrite');
    await Promise.all([
      ...locations.map(loc => tx.objectStore(LOCATIONS_STORE).put(loc)),
      tx.objectStore(META_STORE).put({ key: cacheKey, fetchedAt: Date.now() }),
      tx.done,
    ]);
  } catch (e) {
    // IndexedDB may be unavailable in some contexts (e.g., private browsing in Firefox)
    // Silently fail — app continues working via in-memory cache
  }
}

export async function loadLocations(cacheKey: string): Promise<Location[] | null> {
  try {
    const db = await getDb();
    const meta = await db.get(META_STORE, cacheKey);
    if (!meta) return null;
    if (Date.now() - meta.fetchedAt > CACHE_TTL_MS) return null;
    const all = await db.getAll(LOCATIONS_STORE);
    return all;
  } catch (e) {
    return null;
  }
}

export async function clearOfflineDb(): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction([LOCATIONS_STORE, META_STORE], 'readwrite');
    await Promise.all([
      tx.objectStore(LOCATIONS_STORE).clear(),
      tx.objectStore(META_STORE).clear(),
      tx.done,
    ]);
  } catch (e) {
    // Silently fail
  }
}

export async function isOfflineCacheAvailable(cacheKey: string): Promise<boolean> {
  try {
    const db = await getDb();
    const meta = await db.get(META_STORE, cacheKey);
    if (!meta) return false;
    return Date.now() - meta.fetchedAt <= CACHE_TTL_MS;
  } catch (e) {
    return false;
  }
}
