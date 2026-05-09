import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    include: ["app/features/**/*.spec.ts", "shared/**/*.spec.ts"],
  },
});
