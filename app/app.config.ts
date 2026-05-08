export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      neutral: "zinc",
    },
    button: {
      defaultVariants: {
        color: "primary",
        variant: "solid",
      },
    },
    card: {
      slots: {
        root: "rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800",
      },
    },
  },
});
