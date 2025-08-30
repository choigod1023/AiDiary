import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt", // autoUpdate에서 prompt로 변경
      manifest: {
        name: "Mood Journal",
        short_name: "MoodJournal",
        start_url: "/",
        display: "standalone",
        background_color: "#111827",
        theme_color: "#111827",
        icons: [{ src: "/vite.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: false, // true에서 false로 변경
        clientsClaim: false, // true에서 false로 변경
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(
                request.destination
              ),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-assets" },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "html-docs" },
          },
          {
            urlPattern: /^https:\/\/ai-diary-server\.vercel\.app\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/localhost:5000\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache-dev",
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/choigod1023\.p-e\.kr\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache-custom",
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: [
      "mood-journal-app.vercel.app",
      "choigod1023.p-e.kr",
      "ai-diary-eight-drab.vercel.app",
      "ai-diary-server.vercel.app",
      "localhost:5173",
    ],
  },
});
