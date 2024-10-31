import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import qiankun from "vite-plugin-qiankun-x";
import { dynamicBase } from "vite-plugin-dynamic-base";

const PORT = 6680;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // @ts-ignore
    qiankun("vite-vue", {
      // correct the script src
      urlTransform: (ori) => ori.replace("/__dynamic_base__", ""),
    }),
    dynamicBase({
      publicPath: "window.__dynamic_base__",
      transformIndexHtml: true,
    }),
  ],
  base: process.env.NODE_ENV === "production" ? "/__dynamic_base__/" : "/",
  server: {
    cors: true,
    port: PORT,
    origin: "http://localhost:" + PORT,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
