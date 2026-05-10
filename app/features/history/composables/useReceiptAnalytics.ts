// app/features/history/composables/useReceiptAnalytics.ts
// Aggregates history data for intelligence and analysis views.

import type { SavedReceipt } from "../types/receipt";
import { useReceiptHistory } from "./useReceiptHistory";

export const useReceiptAnalytics = () => {
  const { history } = useReceiptHistory();

  const totalSpent = computed(() => 
    history.value.reduce((sum, r) => sum + r.total_paid, 0)
  );

  const totalSavings = computed(() => 
    history.value.reduce((sum, r) => sum + (r.total_savings || 0), 0)
  );

  const categoryBreakdown = computed(() => {
    const stats: Record<string, number> = {};
    history.value.forEach(receipt => {
      receipt.items.forEach(item => {
        const cat = item.category || 'other';
        stats[cat] = (stats[cat] || 0) + item.total;
      });
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  const topStores = computed(() => {
    const stats: Record<string, number> = {};
    history.value.forEach(receipt => {
      const store = receipt.store || 'Unknown';
      stats[store] = (stats[store] || 0) + receipt.total_paid;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  });

  const monthlyTrend = computed(() => {
    const stats: Record<string, number> = {};
    history.value.forEach(receipt => {
      const date = new Date(receipt.date);
      if (isNaN(date.getTime())) return;
      const month = date.toLocaleString('default', { month: 'short' });
      stats[month] = (stats[month] || 0) + receipt.total_paid;
    });
    // Return last 6 months (simplified)
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  });

  return {
    totalSpent,
    totalSavings,
    categoryBreakdown,
    topStores,
    monthlyTrend
  };
};
