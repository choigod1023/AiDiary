import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.moodjournal.app",
  appName: "MoodJournal",
  webDir: "client/dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
};

export default config;
