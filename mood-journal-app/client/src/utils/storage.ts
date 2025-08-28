// PWA 환경을 위한 스토리지 매니저
export class StorageManager {
  // 데이터 저장
  static async set(key: string, data: unknown): Promise<boolean> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Storage save failed:", error);
      return false;
    }
  }

  // 데이터 조회
  static async get(key: string): Promise<unknown> {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Storage read failed:", error);
      return null;
    }
  }

  // 데이터 삭제
  static async remove(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove failed:", error);
      return false;
    }
  }

  // 모든 데이터 삭제
  static async clear(): Promise<boolean> {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear failed:", error);
      return false;
    }
  }

  // 저장소 상태 확인
  static async getStorageInfo(): Promise<{
    type: "localStorage";
    available: boolean;
    size: number;
  }> {
    try {
      const size = localStorage.length;
      return { type: "localStorage", available: true, size };
    } catch {
      return { type: "localStorage", available: false, size: 0 };
    }
  }

  // IndexedDB 지원 확인 (향후 오프라인 데이터 저장용)
  static isIndexedDBSupported(): boolean {
    return "indexedDB" in window;
  }

  // PWA 설치 상태 확인
  static isPWAInstalled(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true
    );
  }
}
