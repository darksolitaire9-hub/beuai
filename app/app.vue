<script setup lang="ts">
const { hydrate: hydrateHistory } = useReceiptHistory();
const { hydrate: hydrateQueue } = useDocumentQueue();

onMounted(async () => {
  await Promise.all([
    hydrateHistory(),
    hydrateQueue()
  ]);
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>