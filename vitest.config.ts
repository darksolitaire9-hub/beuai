import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["app/features/**/*.spec.ts", "shared/**/*.spec.ts"],
  },
});
