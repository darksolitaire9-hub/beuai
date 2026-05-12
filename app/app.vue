<script setup lang="ts">
const { hydrate: hydrateHistory } = useReceiptHistory();

onMounted(async () => {
  await hydrateHistory();
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>