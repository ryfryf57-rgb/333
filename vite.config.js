import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // чтобы можно было тестить с телефона через локальную сеть
  },
});
