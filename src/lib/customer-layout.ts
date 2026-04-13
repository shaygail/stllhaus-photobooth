import type {
  ReceiptDisplayToggles,
  ReceiptPhotoAspect,
  ReceiptPhotoLayout,
} from "@/components/receipt";

export type CustomerLayoutId = "classic" | "soft-square" | "quiet" | "mini-grid";

export type CustomerLayoutPreset = {
  id: CustomerLayoutId;
  title: string;
  subtitle: string;
  photoAspect: ReceiptPhotoAspect;
  photoLayout: ReceiptPhotoLayout;
  /** Merged over staff toggles for this session’s strip only */
  displayPatch: Partial<ReceiptDisplayToggles>;
};

export const CUSTOMER_LAYOUT_PRESETS: readonly CustomerLayoutPreset[] = [
  {
    id: "classic",
    title: "Classic strip",
    subtitle: "Tall portrait — the timeless receipt moment",
    photoAspect: "3/4",
    photoLayout: "stack",
    displayPatch: {},
  },
  {
    id: "soft-square",
    title: "Soft square",
    subtitle: "A little more balance — still long on the roll",
    photoAspect: "1/1",
    photoLayout: "stack",
    displayPatch: {},
  },
  {
    id: "quiet",
    title: "Quiet minimal",
    subtitle: "Photo first, softer type at the edges",
    photoAspect: "4/5",
    photoLayout: "stack",
    displayPatch: {
      showTagline: false,
      showEndOrnament: false,
    },
  },
  {
    id: "mini-grid",
    title: "Mini Grid",
    subtitle: "4-photo collage",
    photoAspect: "1/1",
    photoLayout: "mini-grid",
    displayPatch: {},
  },
] as const;

export function getCustomerLayoutPreset(
  id: CustomerLayoutId | undefined,
): CustomerLayoutPreset {
  return (
    CUSTOMER_LAYOUT_PRESETS.find((p) => p.id === id) ??
    CUSTOMER_LAYOUT_PRESETS[0]
  );
}
