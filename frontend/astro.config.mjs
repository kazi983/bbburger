// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false,
  },
  //Since we will use /cart, comment out the redirect route
  // redirects: {
  //   "/cart": "/order-summary",
  // },
});
