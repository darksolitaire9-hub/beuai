// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/i18n", "@nuxt/fonts"],
  css: ["~/assets/css/main.css"],

  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "pt", name: "Português", file: "pt.json" },
      { code: "es", name: "Español", file: "es.json" },
      { code: "de", name: "Deutsch", file: "de.json" },
      { code: "hi", name: "हिन्दी", file: "hi.json" },
      { code: "zh", name: "中文", file: "zh.json" },
    ],
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    strategy: "no_prefix",
  },

  vite: {
    optimizeDeps: {
      include: ["browser-image-compression"],
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  components: [
    {
      path: "~/features",
      extensions: [".vue"],
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: [
      "features/**/composables",
      "features/**/utils",
      "features/**/types",
      "features/**/constants",
      "features/**/api",
      "features/**/storage",
    ],
  },

  devServer: {
    https: {
      key: "./localhost+1-key.pem",
      cert: "./localhost+1.pem",
    },
    host: "0.0.0.0", // expose to local network
    port: 3000,
  },
});
