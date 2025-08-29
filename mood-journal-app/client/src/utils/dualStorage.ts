import { StorageManager } from "./storage";
import { diaryApi } from "./api";

export interface SyncableEntry {
  id: string;
  title: string;
  date: string;
  emotion: string;
  entry: string;
  aiFeedback?: string;
  synced: boolean;
  offline: boolean;
  lastModified: string;
  userId?: string;
}

export class DualStorageManager {
  private static readonly STORAGE_KEYS = {
    DIARY_ENTRIES: "diary_entries",
    OFFLINE_ENTRIES: "offline_entries",
    USER_DATA: "user_data",
    SYNC_STATUS: "sync_status",
  };

  // 일기 저장 (이중 저장)
  static async saveEntry(
    entry: Omit<SyncableEntry, "synced" | "offline" | "lastModified">
  ): Promise<boolean> {
    try {
      const syncableEntry: SyncableEntry = {
        ...entry,
        synced: false,
        offline: false,
        lastModified: new Date().toISOString(),
      };

      // 1단계: 즉시 로컬 저장 (UI 반응성)
      const localSaved = await this.saveToLocal(syncableEntry);

      if (localSaved) {
        // 2단계: 백그라운드에서 서버 저장
        this.saveToServer(syncableEntry).then((result) => {
          if (result.success) {
            // 서버 저장 성공 시 동기화 상태 업데이트
            this.updateEntryStatus(entry.id, { synced: true, offline: false });
          } else {
            // 서버 저장 실패 시 오프라인 상태로 표시
            this.updateEntryStatus(entry.id, { synced: false, offline: true });
          }
        });
      }

      return localSaved;
    } catch (error) {
      console.error("Dual save failed:", error);
      return false;
    }
  }

  // 로컬 저장
  private static async saveToLocal(entry: SyncableEntry): Promise<boolean> {
    try {
      const existingEntries = await this.getLocalEntries();
      const updatedEntries = existingEntries.filter((e) => e.id !== entry.id);
      updatedEntries.push(entry);

      return await StorageManager.set(
        this.STORAGE_KEYS.DIARY_ENTRIES,
        updatedEntries
      );
    } catch (error) {
      console.error("Local save failed:", error);
      return false;
    }
  }

  // 서버 저장
  private static async saveToServer(
    entry: SyncableEntry
  ): Promise<{ success: boolean; error?: unknown }> {
    try {
      await diaryApi.create({
        entry: entry.entry,
        title: entry.title,
        visibility: entry.userId ? "private" : "private",
        useAITitle: !entry.title,
      });
      return { success: true };
    } catch (error) {
      console.error("Server save failed:", error);
      return { success: false, error };
    }
  }

  // 로컬에서 일기 목록 조회
  static async getLocalEntries(): Promise<SyncableEntry[]> {
    try {
      const entries = await StorageManager.get(this.STORAGE_KEYS.DIARY_ENTRIES);
      return (entries as SyncableEntry[]) || [];
    } catch (error) {
      console.error("Failed to get local entries:", error);
      return [];
    }
  }

  // 동기화 상태 업데이트
  private static async updateEntryStatus(
    entryId: string,
    status: { synced: boolean; offline: boolean }
  ): Promise<void> {
    try {
      const entries = await this.getLocalEntries();
      const updatedEntries = entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, ...status, lastModified: new Date().toISOString() }
          : entry
      );

      await StorageManager.set(this.STORAGE_KEYS.DIARY_ENTRIES, updatedEntries);
    } catch (error) {
      console.error("Failed to update entry status:", error);
    }
  }

  // 오프라인 데이터 동기화
  static async syncOfflineData(): Promise<{
    success: boolean;
    syncedCount: number;
    errorCount: number;
  }> {
    try {
      const entries = await this.getLocalEntries();
      const offlineEntries = entries.filter((entry) => !entry.synced);

      let syncedCount = 0;
      let errorCount = 0;

      for (const entry of offlineEntries) {
        try {
          const result = await this.saveToServer(entry);
          if (result.success) {
            await this.updateEntryStatus(entry.id, {
              synced: true,
              offline: false,
            });
            syncedCount++;
          } else {
            errorCount++;
          }
        } catch {
          console.error("Sync failed for entry:", entry.id);
          errorCount++;
        }
      }

      return { success: true, syncedCount, errorCount };
    } catch (error) {
      console.error("Sync process failed:", error);
      return { success: false, syncedCount: 0, errorCount: 0 };
    }
  }

  // 동기화 상태 확인
  static async getSyncStatus(): Promise<{
    totalEntries: number;
    syncedEntries: number;
    offlineEntries: number;
    lastSync: string | null;
  }> {
    try {
      const entries = await this.getLocalEntries();
      const lastSync = await StorageManager.get(this.STORAGE_KEYS.SYNC_STATUS);

      return {
        totalEntries: entries.length,
        syncedEntries: entries.filter((e) => e.synced).length,
        offlineEntries: entries.filter((e) => !e.synced).length,
        lastSync: (lastSync as { lastSync?: string })?.lastSync || null,
      };
    } catch (error) {
      console.error("Failed to get sync status:", error);
      return {
        totalEntries: 0,
        syncedEntries: 0,
        offlineEntries: 0,
        lastSync: null,
      };
    }
  }

  // 저장소 정보 조회
  static async getStorageInfo() {
    return await StorageManager.getStorageInfo();
  }

  // 데이터 정리 (동기화된 오래된 데이터 삭제)
  static async cleanupOldData(daysToKeep: number = 30): Promise<number> {
    try {
      const entries = await this.getLocalEntries();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const entriesToKeep = entries.filter((entry) => {
        const entryDate = new Date(entry.lastModified);
        return entryDate > cutoffDate || !entry.synced;
      });

      const deletedCount = entries.length - entriesToKeep.length;

      if (deletedCount > 0) {
        await StorageManager.set(
          this.STORAGE_KEYS.DIARY_ENTRIES,
          entriesToKeep
        );
      }

      return deletedCount;
    } catch (error) {
      console.error("Cleanup failed:", error);
      return 0;
    }
  }
}
