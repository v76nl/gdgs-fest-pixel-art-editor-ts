import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    host: "localhost",
    port: 5173,
    open: true, // 自動でブラウザを開く
  },
});
