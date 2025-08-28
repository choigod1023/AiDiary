import { Capacitor } from "@capacitor/core";

// Capacitor Preferences 타입 정의 (나중에 설치할 예정)
interface PreferencesInterface {
  set(options: { key: string; value: string }): Promise<void>;
  get(options: { key: string }): Promise<{ value: string | null }>;
  remove(options: { key: string }): Promise<void>;
  clear(): Promise<void>;
}

// 동적 import를 위한 Preferences
let Preferences: PreferencesInterface | null = null;

// Capacitor 환경에서 Preferences 초기화
const initPreferences = async () => {
  if (Capacitor.isNativePlatform() && !Preferences) {
    try {
      const { Preferences: CapacitorPreferences } = await import(
        "@capacitor/preferences"
      );
      Preferences = CapacitorPreferences;
    } catch {
      console.warn(
        "Capacitor Preferences not available, falling back to localStorage"
      );
    }
  }
};

export class StorageManager {
  // 환경 감지
  static isNativePlatform() {
    return Capacitor.isNativePlatform();
  }

  // 데이터 저장
  static async set(key: string, data: unknown): Promise<boolean> {
    try {
      await initPreferences();

      if (this.isNativePlatform() && Preferences) {
        // 네이티브 환경: Capacitor Preferences
        await Preferences.set({ key, value: JSON.stringify(data) });
      } else {
        // 웹 환경: LocalStorage
        localStorage.setItem(key, JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error("Storage save failed:", error);
      return false;
    }
  }

  // 데이터 조회
  static async get(key: string): Promise<unknown> {
    try {
      await initPreferences();

      if (this.isNativePlatform() && Preferences) {
        // 네이티브 환경: Capacitor Preferences
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } else {
        // 웹 환경: LocalStorage
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error("Storage read failed:", error);
      return null;
    }
  }

  // 데이터 삭제
  static async remove(key: string): Promise<boolean> {
    try {
      await initPreferences();

      if (this.isNativePlatform() && Preferences) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error("Storage remove failed:", error);
      return false;
    }
  }

  // 모든 데이터 삭제
  static async clear(): Promise<boolean> {
    try {
      await initPreferences();

      if (this.isNativePlatform() && Preferences) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error("Storage clear failed:", error);
      return false;
    }
  }

  // 저장소 상태 확인
  static async getStorageInfo(): Promise<{
    type: "localStorage" | "capacitor" | "fallback";
    available: boolean;
    size?: number;
  }> {
    try {
      await initPreferences();

      if (this.isNativePlatform() && Preferences) {
        return { type: "capacitor", available: true };
      } else {
        const size = localStorage.length;
        return { type: "localStorage", available: true, size };
      }
    } catch {
      return { type: "fallback", available: false };
    }
  }
}
