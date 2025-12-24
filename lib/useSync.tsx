/**
 * React Hooks for Offline/Online Status
 */

import { useState, useEffect, useCallback } from 'react';
import {
    isOnline,
    onNetworkChange,
    getPendingCount,
    hasPendingChanges,
    processSyncQueue,
    SyncOperation
} from './offline-storage';
import { dataService } from './data-service';

// ============================================
// useOnlineStatus - Track network connectivity
// ============================================

export const useOnlineStatus = () => {
    const [online, setOnline] = useState(isOnline());

    useEffect(() => {
        const cleanup = onNetworkChange((isOnline) => {
            setOnline(isOnline);
        });
        return cleanup;
    }, []);

    return online;
};

// ============================================
// usePendingSync - Track pending sync operations
// ============================================

export const usePendingSync = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const online = useOnlineStatus();

    const refreshCount = useCallback(async () => {
        const count = await getPendingCount();
        setPendingCount(count);
    }, []);

    const syncNow = useCallback(async () => {
        if (!online || isSyncing) return;

        setIsSyncing(true);
        try {
            await dataService.syncPendingOperations();
            await refreshCount();
        } finally {
            setIsSyncing(false);
        }
    }, [online, isSyncing, refreshCount]);

    useEffect(() => {
        refreshCount();

        // Refresh count periodically
        const interval = setInterval(refreshCount, 5000);
        return () => clearInterval(interval);
    }, [refreshCount]);

    // Auto-sync when coming online
    useEffect(() => {
        if (online && pendingCount > 0) {
            syncNow();
        }
    }, [online]);

    return {
        pendingCount,
        isSyncing,
        hasPending: pendingCount > 0,
        syncNow,
        refreshCount
    };
};

// ============================================
// SyncStatusIndicator Component
// ============================================

export const SyncStatusBadge = ({ className = '' }: { className?: string }) => {
    const online = useOnlineStatus();
    const { pendingCount, isSyncing } = usePendingSync();

    if (online && pendingCount === 0) {
        return null; // All synced, no indicator needed
    }

    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${className}`}>
            {!online ? (
                <>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <span className="text-gray-500">Offline</span>
                </>
            ) : isSyncing ? (
                <>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-blue-600">Syncing...</span>
                </>
            ) : pendingCount > 0 ? (
                <>
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-orange-600">{pendingCount} pending</span>
                </>
            ) : null}
        </div>
    );
};
