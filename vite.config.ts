import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const pwaOptions: Partial<VitePWAOptions> = {
    mode: "development",
    base: "/",
    registerType: "prompt",
    includeAssets: ["favicon.svg"],
    manifest: {
      id: env.VITE_PWA_ID,
      name: "Prelude Build",
      short_name: "Prelude Build",
      description:
        "An authoring and testing application designed specifically for Security Tests.",
      theme_color: "#21252b",
      background_color: "#21252b",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        /** Cache the images we show in the welcome screen */
        {
          urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "static-image-assets",
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 24 * 60 * 60, // 24 hours
            },
          },
        },
        /** Cache the IBM google font */
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "gstatic-fonts-cache",
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: process.env.SW_DEV === "true",
      type: "module",
      navigateFallback: "index.html",
    },
  };

  return defineConfig({
    plugins: [react(), VitePWA(pwaOptions)],
  });
};
