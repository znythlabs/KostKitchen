/**
 * Offline Storage Service
 * Hybrid implementation: IndexedDB for web, with Capacitor SQLite support for native
 * 
 * Features:
 * - Pending operations queue for offline changes
 * - Network status detection
 * - Auto-sync on reconnection
 * - Server-wins conflict resolution
 */

// ============================================
// TYPES
// ============================================

export interface SyncOperation {
    id: string;
    table: 'ingredients' | 'recipes' | 'recipe_ingredients' | 'expenses' | 'settings' | 'daily_snapshots' | 'orders';
    operation: 'insert' | 'update' | 'delete' | 'upsert';
    payload: any;
    timestamp: number;
    retryCount: number;
    status: 'pending' | 'syncing' | 'failed';
}

interface OfflineStore {
    pendingOperations: SyncOperation[];
    cachedData: {
        ingredients: any[];
        recipes: any[];
        settings: any;
        expenses: any[];
        dailySnapshots: any[];
        orders: any[];
        lastSync: number;
    } | null;
}

// ============================================
// INDEXEDDB IMPLEMENTATION (Web)
// ============================================

const DB_NAME = 'costkitchen_offline';
const DB_VERSION = 3; // Increment again to ensure clean state
const STORE_NAME = 'sync_queue';
const CACHE_STORE = 'data_cache_v2'; // Use new store name to avoid deleteObjectStore issues

let db: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Store for pending sync operations
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }

            // Store for cached data - Always create new version if missing
            // We do NOT delete the old store to prevent potential transaction errors
            if (!database.objectStoreNames.contains(CACHE_STORE)) {
                database.createObjectStore(CACHE_STORE, { keyPath: 'key' });
            }
        };
    });
};

// ============================================
// SYNC QUEUE OPERATIONS
// ============================================

export const addToSyncQueue = async (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> => {
    const db = await openDatabase();
    const id = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const fullOperation: SyncOperation = {
        ...operation,
        id,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending'
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(fullOperation);

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
};

export const getPendingOperations = async (): Promise<SyncOperation[]> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const operations = request.result as SyncOperation[];
            // Sort by timestamp (oldest first)
            resolve(operations.sort((a, b) => a.timestamp - b.timestamp));
        };
        request.onerror = () => reject(request.error);
    });
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const updateOperationStatus = async (id: string, status: SyncOperation['status'], retryCount?: number): Promise<void> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const operation = getRequest.result as SyncOperation;
            if (operation) {
                operation.status = status;
                if (retryCount !== undefined) {
                    operation.retryCount = retryCount;
                }
                const putRequest = store.put(operation);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                resolve();
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

export const clearSyncQueue = async (): Promise<void> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// ============================================
// DATA CACHE OPERATIONS
// ============================================

export const saveDataCache = async (data: OfflineStore['cachedData'] & { userId?: string }): Promise<void> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CACHE_STORE, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE);
        // Store userId with the data blob
        const request = store.put({ key: 'appData', ...data, lastSync: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const loadDataCache = async (expectedUserId?: string): Promise<OfflineStore['cachedData'] | null> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CACHE_STORE, 'readonly');
        const store = transaction.objectStore(CACHE_STORE);
        const request = store.get('appData');

        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                // If specific user ID expected, validate it
                if (expectedUserId && result.userId && result.userId !== expectedUserId) {
                    console.warn(`[Cache] Cache belongs to user ${result.userId}, but expected ${expectedUserId}. Ignoring.`);
                    resolve(null);
                    return;
                }
                const { key, ...data } = result;
                resolve(data as OfflineStore['cachedData']);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const clearDataCache = async (): Promise<void> => {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(CACHE_STORE, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// ============================================
// NETWORK STATUS
// ============================================

export const isOnline = (): boolean => {
    return navigator.onLine;
};

export const onNetworkChange = (callback: (online: boolean) => void): () => void => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
};

// ============================================
// SYNC SERVICE
// ============================================

type SyncCallback = (success: boolean, operation: SyncOperation) => void;

let isSyncing = false;
let syncCallbacks: SyncCallback[] = [];

export const onSyncComplete = (callback: SyncCallback): () => void => {
    syncCallbacks.push(callback);
    return () => {
        syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
    };
};

export const processSyncQueue = async (
    executeOperation: (op: SyncOperation) => Promise<boolean>
): Promise<{ processed: number; failed: number }> => {
    if (isSyncing || !isOnline()) {
        return { processed: 0, failed: 0 };
    }

    isSyncing = true;
    let processed = 0;
    let failed = 0;

    try {
        const operations = await getPendingOperations();

        for (const op of operations) {
            if (!isOnline()) break; // Stop if we go offline

            await updateOperationStatus(op.id, 'syncing');

            try {
                const success = await executeOperation(op);

                if (success) {
                    await removeFromSyncQueue(op.id);
                    processed++;
                    syncCallbacks.forEach(cb => cb(true, op));
                } else {
                    // Retry logic
                    const newRetryCount = op.retryCount + 1;
                    if (newRetryCount >= 3) {
                        await updateOperationStatus(op.id, 'failed', newRetryCount);
                        failed++;
                        syncCallbacks.forEach(cb => cb(false, op));
                    } else {
                        await updateOperationStatus(op.id, 'pending', newRetryCount);
                    }
                }
            } catch (error) {
                console.error('Sync operation failed:', op.id, error);
                await updateOperationStatus(op.id, 'pending', op.retryCount + 1);
            }
        }
    } finally {
        isSyncing = false;
    }

    return { processed, failed };
};

// ============================================
// UTILITY: Get pending count
// ============================================

export const getPendingCount = async (): Promise<number> => {
    const operations = await getPendingOperations();
    return operations.filter(op => op.status === 'pending').length;
};

// ============================================
// UTILITY: Check if has pending changes
// ============================================

export const hasPendingChanges = async (): Promise<boolean> => {
    const count = await getPendingCount();
    return count > 0;
};
