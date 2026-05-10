<!--
  app/components/results/ResultsTab.vue | Component — orchestration only
  Displays a parsed receipt for review and lets the user save or discard it.
  Delegates persistence to useReceiptHistory, scanner state to useReceiptScanner.
  Needs: useReceiptScanner, useReceiptHistory, ResultsItemCard, setTab (inject)
-->

<script setup lang="ts">
import { RECEIPT_CATEGORIES } from "../types/receipt";
import type { ReceiptItem, ParsedReceipt } from "../types/receipt";

const { result, clear } = useReceiptScanner();
const { save } = useReceiptHistory();
const toast = useToast();
const { t } = useI18n();

const setTab = inject<(tab: string) => void>("setTab");

// Local form state for editing
const form = ref<ParsedReceipt | null>(null);

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
    if (setTab) setTab("history");
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
  if (setTab) setTab("scan");
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
</script>

<template>
  <!-- Empty State -->
  <div
    v-if="!form"
    class="flex flex-col items-center justify-center gap-4 p-12 text-center text-muted min-h-full"
  >
    <div class="bg-neutral-50 dark:bg-neutral-900 p-8 rounded-[2.5rem] mb-6 shadow-inner ring-1 ring-neutral-200 dark:ring-neutral-800">
      <UIcon name="i-lucide-receipt" class="size-16 text-faint" />
    </div>
    <div class="space-y-2 mb-8">
      <p class="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Ready for review?</p>
      <p class="text-sm font-medium text-neutral-500 max-w-xs">Scan a receipt to verify and rescue your data.</p>
    </div>
    <UButton size="xl" color="primary" class="font-black uppercase tracking-widest text-xs px-8 h-12" @click="setTab?.('scan')">Go to Scan</UButton>
  </div>

  <!-- Workspace View -->
  <div v-else class="flex flex-col min-h-full bg-white dark:bg-neutral-950 overflow-hidden">
    <!-- Workspace Header -->
    <header class="h-20 flex-shrink-0 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl z-30">
      <div class="flex items-center gap-4">
        <UButton variant="soft" color="neutral" icon="i-lucide-trash-2" class="rounded-full" @click="discard" />
        <div>
           <p class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-0.5">Verification Workspace</p>
           <h1 class="text-xl font-black tracking-tighter truncate max-w-[150px] sm:max-w-md">{{ form.store || 'New Entry' }}</h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton color="primary" class="hidden sm:flex font-black px-8 h-11" @click="saveVerified">Confirm & Save</UButton>
        <UButton color="primary" icon="i-lucide-check" class="sm:hidden rounded-full h-11 w-11 flex items-center justify-center" @click="saveVerified" />
      </div>
    </header>

    <!-- Centered Content Area -->
    <div class="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-6 md:p-10 space-y-12 pb-40 md:pb-20">
      <div v-if="form" class="max-w-2xl mx-auto space-y-12">
        
        <!-- Store Identity Section -->
        <section class="space-y-6">
          <div class="flex items-center gap-3">
            <div class="bg-primary-500 text-white p-2 rounded-xl">
              <UIcon name="i-lucide-store" class="size-5" />
            </div>
            <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">Store Information</h3>
          </div>
          <UInput 
            v-model="form.store" 
            variant="none" 
            class="text-4xl font-black tracking-tighter p-0 h-auto focus:ring-0"
            :placeholder="$t('results.placeholders.store')"
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField :label="$t('results.date')" name="date">
              <UInput v-model="form.date" type="date" size="lg" class="w-full" />
            </UFormField>
            <UFormField :label="$t('results.payment_method')" name="payment">
              <UInput v-model="form.payment_method" size="lg" class="w-full" />
            </UFormField>
          </div>
        </section>

        <!-- Tax & Identity Section -->
        <section class="p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800 space-y-8">
          <div class="flex items-center gap-3">
             <UIcon name="i-lucide-fingerprint" class="size-4 text-neutral-400" />
             <h3 class="text-[10px] font-black uppercase tracking-widest text-neutral-400">Identity & Invoice</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <UFormField :label="$t('results.invoice_number')">
              <UInput v-model="form.invoice_number" variant="soft" size="lg" />
            </UFormField>
            <UFormField :label="$t('results.vendor_tax_id')">
              <UInput v-model="form.vendor_tax_id" variant="soft" size="lg" />
            </UFormField>
            <UFormField :label="$t('results.customer_tax_id')">
              <UInput v-model="form.customer_tax_id" variant="soft" size="lg" />
            </UFormField>
          </div>
        </section>

        <!-- Line Items Section -->
        <section class="space-y-6">
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-3">
               <div class="bg-primary-500 text-white p-2 rounded-xl">
                <UIcon name="i-lucide-list" class="size-5" />
              </div>
              <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">{{ $t('results.line_items') }}</h3>
            </div>
            <UButton variant="soft" size="xs" icon="i-lucide-plus" class="rounded-full" @click="addItem">{{ $t('results.actions.add_item') }}</UButton>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(item, index) in form.items" 
              :key="index"
              class="group bg-white dark:bg-neutral-900 p-6 rounded-[2rem] shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800 hover:ring-primary-500/50 transition-all"
            >
              <div class="grid grid-cols-12 gap-5">
                <div class="col-span-12 sm:col-span-7">
                  <UInput v-model="item.name" :placeholder="$t('results.placeholders.item_name')" variant="none" class="font-black text-lg p-0" />
                </div>
                <div class="col-span-12 sm:col-span-5">
                  <USelect 
                    v-model="item.category" 
                    :options="RECEIPT_CATEGORIES.map(c => ({ label: $t('categories.' + c), value: c }))" 
                    variant="soft"
                    class="w-full"
                  />
                </div>
                <div class="col-span-4">
                  <UFormField :label="$t('results.table.qty')" size="xs">
                    <UInput v-model.number="item.qty" type="number" step="0.01" />
                  </UFormField>
                </div>
                <div class="col-span-4">
                  <UFormField :label="$t('results.table.price')" size="xs">
                    <UInput v-model.number="item.unit_price" type="number" step="0.01" />
                  </UFormField>
                </div>
                <div class="col-span-4 flex items-end justify-between gap-4">
                  <UFormField :label="$t('results.table.total')" size="xs" class="flex-1">
                    <UInput v-model.number="item.total" type="number" step="0.01" class="font-bold" />
                  </UFormField>
                  <UButton icon="i-lucide-trash" color="red" variant="ghost" class="mb-0.5" @click="removeItem(index)" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Totals Section -->
        <section class="pt-10 border-t border-neutral-100 dark:border-neutral-800">
           <UCard class="shadow-2xl rounded-[3rem] overflow-hidden" :ui="{ body: 'p-0 divide-y divide-neutral-100 dark:divide-neutral-800' }">
              <div class="flex justify-between items-center px-10 py-6">
                <span class="text-xs font-black uppercase tracking-widest text-neutral-400">{{ $t('results.subtotal') }}</span>
                <div class="w-32"><UInput v-model.number="form.subtotal" type="number" step="0.01" variant="none" class="text-right font-black text-xl" /></div>
              </div>
              <div class="flex justify-between items-center px-10 py-6">
                <span class="text-xs font-black uppercase tracking-widest text-neutral-400">{{ $t('results.tax_total') }}</span>
                <div class="w-32"><UInput v-model.number="form.tax_total" type="number" step="0.01" variant="none" class="text-right font-black text-xl" /></div>
              </div>
              <div class="flex justify-between items-center px-10 py-6">
                <span class="text-xs font-black uppercase tracking-widest text-neutral-400 text-success-600">{{ $t('results.total_savings') }}</span>
                <div class="w-32"><UInput v-model.number="form.total_savings" type="number" step="0.01" variant="none" class="text-right font-black text-xl text-success-600" /></div>
              </div>
              <div class="flex justify-between items-center px-10 py-12 bg-primary-500 text-white">
                <span class="text-sm font-black uppercase tracking-widest opacity-80">{{ $t('results.total_paid') }}</span>
                <div class="w-48"><UInput v-model.number="form.total_paid" type="number" step="0.01" variant="none" class="text-right text-6xl font-black p-0" /></div>
              </div>
           </UCard>
        </section>
      </div>
    </div>
  </div>
</template>
