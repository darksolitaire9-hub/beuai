// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],

  devServer: {
    https: {
      key: "./localhost+1-key.pem",
      cert: "./localhost+1.pem",
    },
    host: "0.0.0.0", // expose to local network
    port: 3000,
  },
});
