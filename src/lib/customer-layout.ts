import type {
  ReceiptDisplayToggles,
  ReceiptPhotoAspect,
} from "@/components/receipt";

export type CustomerLayoutId = "classic" | "soft-square" | "quiet";

export type CustomerLayoutPreset = {
  id: CustomerLayoutId;
  title: string;
  subtitle: string;
  photoAspect: ReceiptPhotoAspect;
  /** Merged over staff toggles for this session’s strip only */
  displayPatch: Partial<ReceiptDisplayToggles>;
};

export const CUSTOMER_LAYOUT_PRESETS: readonly CustomerLayoutPreset[] = [
  {
    id: "classic",
    title: "Classic strip",
    subtitle: "Tall portrait — the timeless receipt moment",
    photoAspect: "3/4",
    displayPatch: {},
  },
  {
    id: "soft-square",
    title: "Soft square",
    subtitle: "A little more balance — still long on the roll",
    photoAspect: "1/1",
    displayPatch: {},
  },
  {
    id: "quiet",
    title: "Quiet minimal",
    subtitle: "Photo first, softer type at the edges",
    photoAspect: "4/5",
    displayPatch: {
      showTagline: false,
      showEndOrnament: false,
    },
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
