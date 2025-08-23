import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["mood-journal-app.vercel.app", "choigod1023.p-e.kr"],
  },
});
