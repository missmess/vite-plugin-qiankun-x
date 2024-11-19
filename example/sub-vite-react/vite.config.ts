import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import qiankun from "vite-plugin-qiankun-x";

const PORT = 6660;

// https://vite.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [
    react(),
    // @ts-ignore
    qiankun("vite-react"),
  ],
  base: "http://localhost:" + PORT,
  server: {
    cors: true,
    port: PORT,
    origin: "http://localhost:" + PORT,
  },
});
