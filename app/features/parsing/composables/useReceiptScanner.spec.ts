import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReceiptScanner } from "./useReceiptScanner";
import { ref } from "vue";

// Mock dependencies
const mockApi = {
  parse: vi.fn(),
};

vi.mock("../api/useReceiptApi", () => ({
  useReceiptApi: () => mockApi,
}));

vi.mock("../../shared/composables/useReceiptLanguage", () => ({
  useReceiptLanguage: () => ({ lang: ref("pt") }),
}));

// Mock global helper (since it's in the same file in original, but let's assume it's available or mocked)
// The original file has local helpers. We might need to handle them if they cause issues.

describe("useReceiptScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null result and false loading", () => {
    const { result, loading, step } = useReceiptScanner();
    expect(result.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(step.value).toBe(0);
  });

  it("should orchestrate a successful scan", async () => {
    const mockResponse = { store: "Mock Store", total_paid: 10 };
    mockApi.parse.mockResolvedValue(mockResponse);

    const { scan, result, loading, step } = useReceiptScanner();
    
    // We mock blobToBase64 and delay if necessary, or just rely on the implementation if it's testable in JSDOM
    const blob = new Blob(["test"], { type: "image/jpeg" });
    
    const scanPromise = scan(blob);
    
    // Check intermediate states if possible (difficult with async/await without control over microtasks)
    await scanPromise;

    expect(mockApi.parse).toHaveBeenCalled();
    expect(result.value).toEqual(mockResponse);
    expect(loading.value).toBe(false);
    expect(step.value).toBe(0);
  });

  it("should handle scan errors", async () => {
    mockApi.parse.mockRejectedValue(new Error("API Error"));

    const { scan, loading, step } = useReceiptScanner();
    const blob = new Blob(["test"], { type: "image/jpeg" });

    await expect(scan(blob)).rejects.toThrow("API Error");
    
    expect(loading.value).toBe(false);
    expect(step.value).toBe(0);
  });

  it("should clear result", () => {
    const { result, clear } = useReceiptScanner();
    result.value = { store: "Test" } as any;
    
    clear();
    
    expect(result.value).toBeNull();
  });
});
