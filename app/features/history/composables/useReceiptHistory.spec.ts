import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReceiptHistory } from "./useReceiptHistory";
import { ref, computed } from "vue";

// Mock storage dependency
const mockStorage = {
  loadAll: vi.fn(),
  persist: vi.fn(),
  drop: vi.fn(),
  isDuplicate: vi.fn(() => Promise.resolve(false)),
};

vi.mock("../storage/useReceiptStorage", () => ({
  useReceiptStorage: () => mockStorage,
  generateReceiptSignature: () => "mock-signature",
}));

// Mock deepClone
vi.mock("../../shared/utils/clone", () => ({
  deepClone: (val: any) => JSON.parse(JSON.stringify(val)),
}));

describe("useReceiptHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { history } = useReceiptHistory();
    history.value = [];
  });

  it("should hydrate history and sort by savedAt descending", async () => {
    const mockData = [
      { id: "1", savedAt: "2026-01-01T00:00:00Z", total_paid: 10 },
      { id: "2", savedAt: "2026-01-02T00:00:00Z", total_paid: 20 },
    ];
    mockStorage.loadAll.mockResolvedValue(mockData);

    const { history, hydrate } = useReceiptHistory();
    await hydrate();

    expect(history.value).toHaveLength(2);
    expect(history.value[0].id).toBe("2"); // Latest first
  });

  it("should save a receipt and update local state", async () => {
    const mockReceipt = { store: "Test Store", total_paid: 15, items: [] };
    const { history, save } = useReceiptHistory();
    
    await save(mockReceipt as any);

    expect(mockStorage.persist).toHaveBeenCalled();
    expect(history.value).toHaveLength(1);
    expect(history.value[0].store).toBe("Test Store");
    expect(history.value[0].id).toBeDefined();
    expect(history.value[0].savedAt).toBeDefined();
    expect(history.value[0].signature).toBe("mock-signature");
  });

  it("should not save if it's a duplicate", async () => {
    mockStorage.isDuplicate.mockResolvedValueOnce(true);
    const mockReceipt = { store: "Dup Store", total_paid: 10, items: [] };
    const { history, save } = useReceiptHistory();
    
    await save(mockReceipt as any);

    expect(mockStorage.persist).not.toHaveBeenCalled();
    expect(history.value).toHaveLength(0);
  });

  it("should remove a receipt and update local state", async () => {
    const { history, remove } = useReceiptHistory();
    history.value = [{ id: "123", store: "To Delete", total_paid: 10 } as any];

    await remove("123");

    expect(mockStorage.drop).toHaveBeenCalledWith("123");
    expect(history.value).toHaveLength(0);
  });

  it("should compute correct totals", () => {
    const { history, totalSpent } = useReceiptHistory();
    history.value = [
      { total_paid: 10 } as any,
      { total_paid: 25 } as any,
    ];

    expect(totalSpent.value).toBe(35);
  });
});
