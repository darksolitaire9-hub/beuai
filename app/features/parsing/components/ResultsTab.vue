<!--
  app/components/results/ResultsTab.vue | Component — orchestration only
  Displays a parsed receipt for review and lets the user save or discard it.
  Delegates persistence to useReceiptHistory, scanner state to useReceiptScanner.
  Needs: useReceiptScanner, useReceiptHistory, ResultsItemCard, setTab (inject)
-->

<script setup lang="ts">
import { RECEIPT_CATEGORIES } from "../types/receipt";
import type { ReceiptItem, ParsedReceipt } from "../types/receipt";
import type { QueueItem } from "../composables/useDocumentQueue";

const { queue, remove: removeFromQueue, clearDone } = useDocumentQueue();
const { save } = useReceiptHistory();
const toast = useToast();
const { t } = useI18n();

const setTab = inject<(tab: string) => void>("setTab");

// Local state for the item being edited
const selectedQueueItem = ref<QueueItem | null>(null);
const form = ref<ParsedReceipt | null>(null);

// Zoom modal state
const isZoomOpen = ref(false);

// If the queue only has one item ready, auto-select it
watch(queue, (newQueue) => {
  const ready = newQueue.filter(i => i.status === 'review_needed');
  if (ready.length === 1 && !selectedQueueItem.value) {
    selectItem(ready[0]);
  }
}, { immediate: true, deep: true });

function selectItem(item: QueueItem) {
  if (item.result) {
    selectedQueueItem.value = item;
    form.value = JSON.parse(JSON.stringify(item.result));
  }
}

function backToDashboard() {
  selectedQueueItem.value = null;
  form.value = null;
}

async function saveVerified() {
  if (!form.value || !selectedQueueItem.value) return;
  try {
    await save(form.value);
    
    // Mark as done and remove from queue
    await removeFromQueue(selectedQueueItem.value.id);
    
    toast.add({
      title: t("results.alerts.saved"),
      icon: "i-lucide-check-circle",
      color: "success",
    });

    backToDashboard();

    // If queue is now empty, go to history
    if (queue.value.length === 0 && setTab) {
      setTab("history");
    }
  } catch (err) {
    toast.add({
      title: t("results.alerts.save_failed"),
      description: t("results.alerts.storage_full"),
      color: "error",
    });
  }
}

async function discard() {
  if (selectedQueueItem.value) {
    await removeFromQueue(selectedQueueItem.value.id);
  }
  
  toast.add({
    title: t("results.alerts.discarded"),
    icon: "i-lucide-trash-2",
    color: "neutral",
  });

  backToDashboard();
  
  if (queue.value.length === 0 && setTab) {
    setTab("scan");
  }
}

function addItem() {
  if (!form.value) return;
  form.value.items.push({
    name: "New Item",
    category: "other",
    qty: 1,
    unit_price: 0,
    total: 0,
    tax_rate: null,
    discount: 0,
    pack: null,
  });
}

function removeItem(index: number) {
  if (!form.value) return;
  form.value.items.splice(index, 1);
}

// Auto-calculate subtotal/total if items change
watch(() => form.value?.items, (items) => {
  if (!form.value || !items) return;
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  form.value.subtotal = Math.round(subtotal * 100) / 100;
  form.value.total_paid = Math.round((form.value.subtotal + (form.value.tax_total || 0) - (form.value.total_savings || 0)) * 100) / 100;
}, { deep: true });

const readyCount = computed(() => queue.value.filter(i => i.status === 'review_needed').length);
</script>

<template>
  <!-- Empty State -->
  <div
    v-if="queue.length === 0"
    class="flex flex-col items-center justify-center gap-4 p-12 text-center text-muted min-h-full"
  >
    <div class="bg-neutral-50 dark:bg-neutral-900 p-8 rounded-full mb-4">
      <UIcon name="i-lucide-inbox" class="size-12 text-faint" />
    </div>
    <p class="text-sm font-bold">{{ $t('history.no_data') }}</p>
    <UButton variant="soft" color="primary" @click="setTab?.('scan')">Go to Scan</UButton>
  </div>

  <!-- Dashboard View (Bulk List) -->
  <div v-else-if="!selectedQueueItem" class="flex flex-col min-h-full p-6 space-y-8 pb-32">
    <div class="space-y-1">
      <h2 class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white">{{ $t('queue.active') }}</h2>
      <p class="text-sm font-medium text-neutral-500">{{ readyCount }} documents ready for verification.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard 
        v-for="item in queue" 
        :key="item.id"
        class="group cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
        :ui="{ body: 'p-0 overflow-hidden' }"
        @click="item.status === 'review_needed' && selectItem(item)"
      >
        <div class="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 relative">
          <img 
            v-if="item.result?._image" 
            :src="item.result._image" 
            class="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" 
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
            <UIcon name="i-lucide-file-text" class="size-10 text-neutral-400" />
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
             <UBadge 
               :color="item.status === 'review_needed' ? 'primary' : 'neutral'" 
               variant="solid"
               class="font-black uppercase tracking-widest text-[10px]"
             >
               {{ $t(`queue.status.${item.status}`) || item.status.replace('_', ' ') }}
             </UBadge>
          </div>
        </div>
        <div class="p-4">
          <p class="font-black truncate">{{ item.result?.store || item.file.name }}</p>
          <p class="text-[10px] font-bold text-neutral-500 uppercase mt-1">{{ item.result?.date || 'Pending Analysis' }}</p>
        </div>
      </UCard>
    </div>
  </div>

  <!-- Edit View (Verification Gate) -->
  <div v-else class="flex flex-col lg:flex-row min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Image Verification Sidebar (Sticky on Desktop) -->
    <div class="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 p-4 lg:p-6 bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
      <div 
        class="relative w-full h-full max-h-[80vh] lg:max-h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 bg-white cursor-zoom-in"
        @click="isZoomOpen = true"
      >
        <img 
          :src="form?._image" 
          alt="Original Document" 
          class="w-full h-full object-contain"
        />
        <div class="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
          {{ $t('results.visual_evidence') }}
        </div>
      </div>
    </div>

    <!-- Zoom Modal -->
    <UModal v-model="isZoomOpen" fullscreen>
      <UCard :ui="{ body: 'p-0 flex flex-col h-full', header: 'px-4 py-3' }">
        <template #header>
          <div class="flex items-center justify-between">
            <p class="text-xs font-black uppercase tracking-widest">{{ $t('results.visual_evidence') }}</p>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isZoomOpen = false" />
          </div>
        </template>
        <div class="flex-1 overflow-auto bg-neutral-950 p-4 flex items-start justify-center">
          <img :src="form?._image" class="max-w-none w-auto h-auto min-w-full lg:min-w-0 lg:max-w-4xl" />
        </div>
      </UCard>
    </UModal>

    <!-- Edit Form Area -->
    <div v-if="form" class="lg:w-1/2 flex flex-col pb-40 md:pb-12">
      <div class="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div class="flex items-center justify-between mb-4">
          <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left" size="xs" @click="backToDashboard">Back to Queue</UButton>
          <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-[0.2em]">
            <UIcon name="i-lucide-verified" class="size-4" />
            {{ $t("results.title") }}
          </div>
        </div>
        <UInput 
          v-model="form.store" 
          variant="none" 
          class="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white p-0 h-auto"
          :placeholder="$t('results.placeholders.store')"
        />
      </div>

      <div class="p-6 space-y-8">
        <!-- Metadata Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-neutral-900 rounded-3xl shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
          <UFormGroup :label="$t('results.date')" name="date">
            <UInput v-model="form.date" type="date" icon="i-lucide-calendar" />
          </UFormGroup>
          <UFormGroup :label="$t('results.invoice_number')" name="invoice">
            <UInput v-model="form.invoice_number" icon="i-lucide-hash" />
          </UFormGroup>
          <UFormGroup :label="$t('results.vendor_tax_id')" name="v_tax">
            <UInput v-model="form.vendor_tax_id" icon="i-lucide-fingerprint" />
          </UFormGroup>
          <UFormGroup :label="$t('results.customer_tax_id')" name="c_tax">
            <UInput v-model="form.customer_tax_id" icon="i-lucide-user" />
          </UFormGroup>
        </div>

        <!-- Line Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between px-2">
            <p class="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400">
              {{ $t('results.line_items') }}
            </p>
            <UButton 
              icon="i-lucide-plus" 
              variant="ghost" 
              color="primary" 
              size="xs" 
              @click="addItem"
            >
              {{ $t('results.actions.add_item') }}
            </UButton>
          </div>

          <div class="space-y-3">
            <div 
              v-for="(item, index) in form.items" 
              :key="index"
              class="group relative bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-primary-500/50 transition-all"
            >
              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-6">
                  <UInput v-model="item.name" :placeholder="$t('results.placeholders.item_name')" variant="none" class="font-bold p-0" />
                </div>
                <div class="col-span-12 md:col-span-6">
                  <USelect 
                    v-model="item.category" 
                    :options="RECEIPT_CATEGORIES.map(c => ({ label: $t('categories.' + c), value: c }))" 
                    class="w-full"
                  />
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup :label="$t('results.table.qty')" size="xs">
                    <UInput v-model.number="item.qty" type="number" step="0.01" />
                  </UFormGroup>
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup :label="$t('results.table.price')" size="xs">
                    <UInput v-model.number="item.unit_price" type="number" step="0.01" />
                  </UFormGroup>
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup :label="$t('results.table.total')" size="xs">
                    <UInput v-model.number="item.total" type="number" step="0.01" />
                  </UFormGroup>
                </div>
                <div class="col-span-12 md:col-span-3 flex items-end">
                   <UButton 
                    icon="i-lucide-trash" 
                    color="red" 
                    variant="soft" 
                    block
                    @click="removeItem(index)"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals Summary -->
        <div class="space-y-4">
          <p class="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-400 ml-1">
            {{ $t("results.summary") }}
          </p>
          <UCard class="shadow-xl ring-2 ring-primary-500/10 dark:ring-primary-400/10" :ui="{ body: 'p-0 divide-y divide-neutral-100 dark:divide-neutral-800' }">
            <div class="flex justify-between items-center px-6 py-4 text-sm">
              <span class="text-neutral-500 font-bold">{{ $t("results.subtotal") }}</span>
              <div class="w-32"><UInput v-model.number="form.subtotal" type="number" step="0.01" variant="none" class="text-right font-black" /></div>
            </div>
            <div class="flex justify-between items-center px-6 py-4 text-sm">
              <span class="text-neutral-500 font-bold">{{ $t("results.tax_total") }}</span>
              <div class="w-32"><UInput v-model.number="form.tax_total" type="number" step="0.01" variant="none" class="text-right font-black" /></div>
            </div>
            <div class="flex justify-between items-center px-6 py-4 text-sm">
              <span class="text-neutral-500 font-bold">{{ $t("results.total_savings") }}</span>
              <div class="w-32"><UInput v-model.number="form.total_savings" type="number" step="0.01" variant="none" class="text-right font-black text-success-600" /></div>
            </div>
            <div class="flex justify-between items-center px-6 py-8 bg-primary-50/30 dark:bg-primary-950/20">
              <span class="font-black text-xl text-neutral-900 dark:text-white uppercase tracking-tight">{{ $t("results.total_paid") }}</span>
              <div class="w-48"><UInput v-model.number="form.total_paid" type="number" step="0.01" variant="none" class="text-right text-4xl font-black text-primary-600 dark:text-primary-400 p-0" /></div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-neutral-50/95 dark:from-neutral-950/95 to-transparent z-30 lg:relative lg:bg-transparent lg:mt-auto">
        <div class="max-w-2xl mx-auto flex flex-wrap gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-trash-2"
            size="xl"
            class="flex-1 min-w-[120px] justify-center font-black uppercase tracking-wider text-xs h-14"
            :label="$t('results.actions.discard')"
            @click="discard"
          />
          <UButton 
            icon="i-lucide-check-circle" 
            size="xl"
            class="flex-[2] min-w-[200px] justify-center font-black uppercase tracking-wider text-xs h-14 shadow-lg shadow-primary-500/20" 
            :label="$t('results.actions.save')"
            @click="saveVerified"
          />
        </div>
      </div>
    </div>
  </div>
</template>
