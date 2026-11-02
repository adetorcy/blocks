import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/blocks/",
  // Phones try the build through a Cloudflare quick tunnel
  // Each tunnel gets a new subdomain
  // Vite refuses hosts it doesn't know
  preview: {
    allowedHosts: [".trycloudflare.com"],
  },
});
