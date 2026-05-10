<!--
  app/components/results/ResultsTab.vue | Component — orchestration only
  Displays a parsed receipt for review and lets the user save or discard it.
  Delegates persistence to useReceiptHistory, scanner state to useReceiptScanner.
  Needs: useReceiptScanner, useReceiptHistory, ResultsItemCard, setTab (inject)
-->

<script setup lang="ts">
import type { ReceiptItem, ParsedReceipt } from "../types/receipt";

const { result, clear } = useReceiptScanner();
const { save } = useReceiptHistory();
const toast = useToast();
const { t } = useI18n();

const _setTab = inject<(tab: string) => void>("setTab");
if (!_setTab) throw new Error("setTab injection is missing");
const setTab = _setTab;

// Local form state for editing
const form = ref<ParsedReceipt | null>(null);

// Categories enum from our plan
const categories = [
  "supermarket",
  "utilities",
  "restaurant",
  "office_supplies",
  "fuel",
  "other",
];

// Watch for result changes to populate the form
watch(result, (newResult) => {
  if (newResult) {
    form.value = JSON.parse(JSON.stringify(newResult));
  } else {
    form.value = null;
  }
}, { immediate: true });

async function saveVerified() {
  if (!form.value) return;
  try {
    await save(form.value);
    clear();
    toast.add({
      title: t("results.alerts.saved"),
      icon: "i-lucide-check-circle",
      color: "success",
    });
    setTab("history");
  } catch (err) {
    toast.add({
      title: t("results.alerts.save_failed"),
      description: t("results.alerts.storage_full"),
      color: "error",
    });
  }
}

function discard() {
  clear();
  toast.add({
    title: t("results.alerts.discarded"),
    icon: "i-lucide-trash-2",
    color: "neutral",
  });
  setTab("scan");
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

// Auto-calculate subtotal/total if items change (optional quality helper)
watch(() => form.value?.items, (items) => {
  if (!form.value || !items) return;
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  form.value.subtotal = Math.round(subtotal * 100) / 100;
  form.value.total_paid = Math.round((form.value.subtotal + (form.value.tax_total || 0)) * 100) / 100;
}, { deep: true });
</script>

<template>
  <div
    v-if="!form"
    class="flex flex-col items-center justify-center gap-4 p-12 text-center text-muted"
  >
    <UIcon name="i-lucide-receipt" class="size-10 text-faint" />
    <p class="text-sm">Scan a document to verify results here.</p>
  </div>

  <div v-else class="flex flex-col lg:flex-row min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Image Verification Sidebar (Sticky on Desktop) -->
    <div class="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 p-4 lg:p-6 bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
      <div class="relative w-full h-full max-h-[80vh] lg:max-h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 bg-white">
        <img 
          :src="form._image" 
          alt="Original Document" 
          class="w-full h-full object-contain"
        />
        <div class="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
          Visual Evidence
        </div>
      </div>
    </div>

    <!-- Edit Form Area -->
    <div class="lg:w-1/2 flex flex-col pb-40 md:pb-12">
      <div class="px-6 py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
          <UIcon name="i-lucide-verified" class="size-4" />
          {{ $t("results.title") }}
        </div>
        <UInput 
          v-model="form.store" 
          variant="none" 
          class="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white p-0 h-auto"
          placeholder="Store Name"
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
              Line Items
            </p>
            <UButton 
              icon="i-lucide-plus" 
              variant="ghost" 
              color="primary" 
              size="xs" 
              @click="addItem"
            >
              Add Item
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
                  <UInput v-model="item.name" placeholder="Item name" variant="none" class="font-bold p-0" />
                </div>
                <div class="col-span-12 md:col-span-6">
                  <USelect 
                    v-model="item.category" 
                    :options="categories.map(c => ({ label: $t('categories.' + c), value: c }))" 
                    class="w-full"
                  />
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup label="Qty" size="xs">
                    <UInput v-model.number="item.qty" type="number" step="0.01" />
                  </UFormGroup>
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup label="Price" size="xs">
                    <UInput v-model.number="item.unit_price" type="number" step="0.01" />
                  </UFormGroup>
                </div>
                <div class="col-span-4 md:col-span-3">
                  <UFormGroup label="Total" size="xs">
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
