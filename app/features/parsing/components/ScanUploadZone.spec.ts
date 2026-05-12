import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ScanUploadZone from "./ScanUploadZone.vue";

const { mockToast, mockI18n } = vi.hoisted(() => ({
  mockToast: {
    add: vi.fn(),
  },
  mockI18n: {
    t: vi.fn((key: string) => key),
  }
}));

mockNuxtImport("useToast", () => () => mockToast);
mockNuxtImport("useI18n", () => () => mockI18n);

describe("ScanUploadZone", () => {
  const mountOptions = {
    global: {
      stubs: {
        UIcon: true,
      },
      mocks: {
        $t: mockI18n.t,
      }
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default slot content", () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    expect(wrapper.text()).toContain("scan.choose_file");
  });

  it("updates isDragging state on drag events", async () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    const zone = wrapper.find('[role="button"]');

    await zone.trigger("dragenter");
    expect(wrapper.vm.isDragging).toBe(true);

    await zone.trigger("dragleave");
    expect(wrapper.vm.isDragging).toBe(false);
  });

  it("emits upload event on file drop", async () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    
    // Create a proper DragEvent
    const dropEvent = {
      dataTransfer: {
        files: [file],
        types: ["Files"]
      }
    };
    
    await wrapper.find('[role="button"]').trigger("drop", dropEvent);

    expect(wrapper.emitted("upload")).toBeTruthy();
    expect(wrapper.emitted("upload")![0]).toEqual([file]);
  });

  it("triggers file input on click", async () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");

    await wrapper.find('[role="button"]').trigger("click");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("validates file size", async () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    // 11MB file
    const largeFile = new File([""], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const dropEvent = {
      dataTransfer: {
        files: [largeFile],
        types: ["Files"]
      }
    };

    await wrapper.find('[role="button"]').trigger("drop", dropEvent);

    expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
      title: "scan.alerts.too_large",
      color: "warning"
    }));
    expect(wrapper.emitted("upload")).toBeFalsy();
  });

  it("validates file format", async () => {
    const wrapper = mount(ScanUploadZone, mountOptions);
    const heicFile = new File([""], "test.heic", { type: "image/heic" });

    const dropEvent = {
      dataTransfer: {
        files: [heicFile],
        types: ["Files"]
      }
    };

    await wrapper.find('[role="button"]').trigger("drop", dropEvent);

    expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
      title: "scan.alerts.invalid_format",
      color: "warning"
    }));
    expect(wrapper.emitted("upload")).toBeFalsy();
  });
});
