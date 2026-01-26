import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // 👈 THIS fixes "test is not defined"
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
