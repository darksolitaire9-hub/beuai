import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReceiptScanner } from "./useReceiptScanner";
import { ref } from "vue";

// Mock dependencies
const mockApi = {
  parse: vi.fn(),
};

const mockCompression = {
  compressForOcr: vi.fn((file) => Promise.resolve(file)),
};

vi.mock("../api/useReceiptApi", () => ({
  useReceiptApi: () => mockApi,
}));

vi.mock("../composables/useImageCompression", () => ({
  useImageCompression: () => mockCompression,
}));

vi.mock("../../shared/composables/useReceiptLanguage", () => ({
  useReceiptLanguage: () => ({ lang: ref("pt") }),
}));

describe("useReceiptScanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null result and false loading", () => {
    const { result, loading, stage } = useReceiptScanner();
    expect(result.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(stage.value).toBe("idle");
  });

  it("should orchestrate a successful scan", async () => {
    const mockResponse = { store: "Mock Store", total_paid: 10 };
    mockApi.parse.mockResolvedValue(mockResponse);

    const { scan, result, loading, stage } = useReceiptScanner();
    
    const blob = new Blob(["test"], { type: "image/jpeg" });
    
    await scan(blob);

    expect(mockCompression.compressForOcr).toHaveBeenCalled();
    expect(mockApi.parse).toHaveBeenCalled();
    expect(result.value).toEqual({
      ...mockResponse,
      _image: expect.any(String)
    });
    expect(loading.value).toBe(false);
    expect(stage.value).toBe("idle");
  });

  it("should handle scan errors", async () => {
    mockApi.parse.mockRejectedValue(new Error("API Error"));

    const { scan, loading, stage } = useReceiptScanner();
    const blob = new Blob(["test"], { type: "image/jpeg" });

    await expect(scan(blob)).rejects.toThrow("API Error");
    
    expect(loading.value).toBe(false);
    expect(stage.value).toBe("idle");
  });

  it("should clear result", () => {
    const { result, clear } = useReceiptScanner();
    result.value = { store: "Test" } as any;
    
    clear();
    
    expect(result.value).toBeNull();
  });
});
