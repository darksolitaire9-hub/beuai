export default defineAppConfig({
  ui: {
    colors: {
      primary: "emerald",
      neutral: "slate",
    },
    button: {
      slots: {
        base: "transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2",
      },
      defaultVariants: {
        color: "primary",
        variant: "solid",
        size: "md",
      },
    },
    card: {
      slots: {
        root: "rounded-[--ui-radius] bg-white dark:bg-neutral-900 shadow-md ring-1 ring-neutral-950/5 dark:ring-white/5 overflow-hidden transition-all duration-300",
        header: "px-6 py-5 border-b border-neutral-100 dark:border-neutral-800",
        body: "p-6",
        footer: "px-6 py-4 bg-neutral-50/50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800",
      },
    },
    badge: {
      slots: {
        base: "font-bold tracking-tight uppercase px-2 py-0.5 rounded-full",
      },
      defaultVariants: {
        variant: "soft",
        size: "sm",
      },
    },
    alert: {
      slots: {
        root: "rounded-xl border-none shadow-sm",
        title: "font-bold",
      },
    },
  },
});
