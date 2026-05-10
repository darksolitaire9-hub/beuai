<!--
  app/components/history/HistoryReceiptDetail.vue | Component
  Shows a full SavedReceipt in a centered overlay for review and export.
  Supports editing fields and saving changes to persistence.
  Needs: SavedReceipt, ReceiptItem, useReceiptHistory
-->

<script setup lang="ts">
import type { SavedReceipt } from "../types/receipt";
import type { ReceiptItem } from "../../parsing/types/receipt";
import { RECEIPT_CATEGORIES } from "../../parsing/types/receipt";

const props = defineProps<{
    receipt: SavedReceipt;
    open: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();

const { update } = useReceiptHistory();
const toast = useToast();
const { t } = useI18n();

const isEditing = ref(false);
const form = ref<SavedReceipt | null>(null);

// Initialize form when editing starts or receipt changes
watch(() => props.receipt, (newVal) => {
    if (newVal) form.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true });

const fmt = (n: number) => `€${(n || 0).toFixed(2)}`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const categoryGroups = computed(() => {
    const data = isEditing.value ? form.value : props.receipt;
    if (!data) return {};
    const acc: Record<string, ReceiptItem[]> = {};
    for (const item of data.items) {
        const category = item.category;
        const group = acc[category] ?? (acc[category] = []);
        group.push(item);
    }
    return acc;
});

function close() {
    isEditing.value = false;
    emit("close");
}

async function saveChanges() {
    if (!form.value) return;
    try {
        await update(props.receipt.id, form.value);
        isEditing.value = false;
        toast.add({ title: t('results.alerts.saved'), color: "success" });
    } catch {
        toast.add({ title: t('results.alerts.save_failed'), color: "error" });
    }
}

function toggleEdit() {
    if (isEditing.value) {
        // Cancel: reset form
        form.value = JSON.parse(JSON.stringify(props.receipt));
    }
    isEditing.value = !isEditing.value;
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

function removeItem(category: string, index: number) {
    if (!form.value) return;
    // Find absolute index in form.items
    const itemToRemove = categoryGroups.value[category][index];
    const absoluteIndex = form.value.items.indexOf(itemToRemove);
    if (absoluteIndex > -1) {
        form.value.items.splice(absoluteIndex, 1);
    }
}

// Recalculate totals if editing
watch(() => form.value?.items, (items) => {
  if (!isEditing.value || !form.value || !items) return;
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  form.value.subtotal = Math.round(subtotal * 100) / 100;
  form.value.total_paid = Math.round((form.value.subtotal + (form.value.tax_total || 0) - (form.value.total_savings || 0)) * 100) / 100;
}, { deep: true });
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                @click.self="close"
            >
                <div
                    class="bg-white dark:bg-neutral-900 md:rounded-[3rem] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800"
                >
                    <header
                        class="flex items-start justify-between gap-4 px-10 pt-10 pb-8 border-b border-neutral-100 dark:border-neutral-800"
                    >
                        <div class="min-w-0 flex-1">
                            <UInput 
                                v-if="isEditing && form" 
                                v-model="form.store" 
                                variant="none" 
                                class="text-3xl font-black tracking-tighter p-0 h-auto focus:ring-0 w-full" 
                            />
                            <h2 v-else class="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white truncate">
                                {{ receipt.store }}
                            </h2>
                            <div class="flex items-center gap-3 mt-3 flex-wrap">
                                <template v-if="isEditing && form">
                                    <UInput v-model="form.date" type="date" size="xs" variant="soft" class="w-32" />
                                </template>
                                <p v-else class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                    {{ formatDate(receipt.date) }}
                                </p>
                                <div class="size-1 rounded-full bg-neutral-300 flex-shrink-0" />
                                <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                    {{ (isEditing ? form?.items.length : receipt.items.length) }} {{ $t('results.items') }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                             <UButton
                                variant="soft"
                                :color="isEditing ? 'error' : 'neutral'"
                                :icon="isEditing ? 'i-lucide-x' : 'i-lucide-edit-3'"
                                size="sm"
                                class="rounded-full h-10 w-10 flex items-center justify-center"
                                @click="toggleEdit"
                            />
                            <UButton
                                v-if="!isEditing"
                                variant="soft"
                                color="neutral"
                                icon="i-lucide-x"
                                size="sm"
                                class="rounded-full h-10 w-10 flex items-center justify-center"
                                @click="close"
                            />
                        </div>
                    </header>

                    <!-- Scrollable content -->
                    <div class="flex-1 overflow-y-auto p-10 space-y-10 bg-neutral-50/30 dark:bg-neutral-900/30">
                        <!-- Items grouped -->
                        <div
                            v-for="(items, category) in categoryGroups"
                            :key="category"
                            class="space-y-6"
                        >
                            <div class="flex items-center gap-4">
                                <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">
                                    {{ category }}
                                </p>
                                <div class="h-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                            </div>
                            <ul class="flex flex-col gap-6" role="list">
                                <li
                                    v-for="(item, idx) in items"
                                    :key="`${category}-${idx}`"
                                    class="flex items-start justify-between gap-6"
                                >
                                    <div class="flex-1 min-w-0">
                                        <template v-if="isEditing">
                                            <UInput v-model="item.name" variant="soft" size="sm" class="font-bold mb-2" />
                                            <div class="flex items-center gap-3">
                                                 <UInput v-model.number="item.qty" type="number" step="0.1" size="xs" class="w-16" />
                                                 <span class="text-xs text-neutral-400">×</span>
                                                 <UInput v-model.number="item.unit_price" type="number" step="0.01" size="xs" class="w-20" />
                                            </div>
                                        </template>
                                        <template v-else>
                                            <p class="font-bold text-neutral-900 dark:text-white leading-snug">{{ item.name }}</p>
                                            <p class="text-[11px] text-neutral-500 font-bold mt-1 tracking-tight">
                                                {{ item.qty }} × {{ fmt(item.unit_price) }}
                                                <span v-if="item.discount > 0" class="text-emerald-500 ml-1">
                                                    (−{{ fmt(item.discount) }})
                                                </span>
                                            </p>
                                        </template>
                                    </div>
                                    <div class="text-right flex flex-col items-end gap-2">
                                        <template v-if="isEditing">
                                            <UInput v-model.number="item.total" type="number" step="0.01" size="sm" class="w-24 font-black" />
                                            <UButton icon="i-lucide-trash" color="red" variant="ghost" size="xs" @click="removeItem(category as string, idx)" />
                                        </template>
                                        <p v-else class="font-black tabular-nums text-neutral-900 dark:text-white text-lg tracking-tighter">
                                            {{ fmt(item.total) }}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div v-if="isEditing" class="flex justify-center pt-4">
                             <UButton variant="soft" color="primary" icon="i-lucide-plus" class="rounded-full px-6 font-black uppercase tracking-widest text-[10px]" @click="addItem">Add Item</UButton>
                        </div>

                        <!-- Totals Section -->
                        <div class="pt-10 border-t border-neutral-100 dark:border-neutral-800 space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-4">
                                     <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        <span>{{ $t('results.subtotal') }}</span>
                                        <template v-if="isEditing && form">
                                            <UInput v-model.number="form.subtotal" type="number" step="0.01" size="xs" variant="soft" class="w-20 text-right" />
                                        </template>
                                        <span v-else class="text-neutral-900 dark:text-white tabular-nums">{{ fmt(isEditing ? form?.subtotal : receipt.subtotal) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        <span>{{ $t('results.tax_total') }}</span>
                                        <template v-if="isEditing && form">
                                            <UInput v-model.number="form.tax_total" type="number" step="0.01" size="xs" variant="soft" class="w-20 text-right" />
                                        </template>
                                        <span v-else class="text-neutral-900 dark:text-white tabular-nums">{{ fmt(isEditing ? form?.tax_total : receipt.tax_total) }}</span>
                                    </div>
                                    <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                        <span>{{ $t('results.total_savings') }}</span>
                                        <template v-if="isEditing && form">
                                            <UInput v-model.number="form.total_savings" type="number" step="0.01" size="xs" variant="soft" class="w-20 text-right" />
                                        </template>
                                        <span v-else class="tabular-nums font-black">{{ fmt(isEditing ? form?.total_savings : receipt.total_savings) }}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col items-end justify-center px-8 py-6 rounded-[2.5rem] bg-primary-500 text-white shadow-xl shadow-primary-500/20">
                                    <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">{{ $t('results.total_paid') }}</span>
                                    <template v-if="isEditing && form">
                                        <UInput v-model.number="form.total_paid" type="number" step="0.01" variant="none" class="text-right text-4xl font-black p-0 w-full text-white" />
                                    </template>
                                    <span v-else class="font-black text-5xl tabular-nums tracking-tighter leading-none">
                                        {{ fmt(isEditing ? form?.total_paid : receipt.total_paid).replace('€', '') }}<span class="text-xl ml-1">€</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="pt-6 flex items-center justify-between">
                             <template v-if="isEditing && form">
                                <UInput v-model="form.payment_method" size="sm" variant="soft" class="w-40" icon="i-lucide-credit-card" />
                             </template>
                             <UBadge
                                v-else
                                variant="soft"
                                color="neutral"
                                class="text-[10px] font-black px-3"
                                icon="i-lucide-credit-card"
                             >
                                {{ receipt.payment_method }}
                             </UBadge>
                             <p class="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">VERIFIED AI</p>
                        </div>
                    </div>

                    <!-- Actions footer when editing -->
                    <footer v-if="isEditing" class="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-4">
                        <UButton variant="soft" color="neutral" class="flex-1 font-black uppercase tracking-widest text-xs h-12" @click="toggleEdit">Discard Changes</UButton>
                        <UButton color="primary" class="flex-[2] font-black uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary-500/20" @click="saveChanges">Save Intelligence</UButton>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
