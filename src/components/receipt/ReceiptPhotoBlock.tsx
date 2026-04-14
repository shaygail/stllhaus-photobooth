import type {
  PaperWidth,
  ReceiptPhotoAspect,
  ReceiptPhotoLayout,
  ReceiptThermalAdjust,
} from "./types";

type ReceiptPhotoBlockProps = {
  photoUrl: string;
  additionalPhotoUrls?: readonly string[];
  paperWidth: PaperWidth;
  photoAspect?: ReceiptPhotoAspect;
  photoLayout?: ReceiptPhotoLayout;
  alt?: string;
  thermal?: ReceiptThermalAdjust;
};

const ASPECT_RATIO_STYLE: Record<ReceiptPhotoAspect, string> = {
  "3/4": "3 / 4",
  "1/1": "1 / 1",
  "4/5": "4 / 5",
};

/**
 * Single primary frame today; `additionalPhotoUrls` reserved for future strips.
 */
const DEFAULT_THERMAL: ReceiptThermalAdjust = {
  brightness: 1.03,
  contrast: 1.22,
};

export function ReceiptPhotoBlock({
  photoUrl,
  additionalPhotoUrls,
  paperWidth,
  photoAspect = "3/4",
  photoLayout = "stack",
  alt = "Photobooth moment",
  thermal = DEFAULT_THERMAL,
}: ReceiptPhotoBlockProps) {
  const isNarrow = paperWidth === "58mm";
  const urls = [photoUrl, ...(additionalPhotoUrls ?? [])];
  const useGrid6 = !isNarrow && photoLayout === "mini-grid" && urls.length >= 6;
  const useGrid4 = !isNarrow && photoLayout === "mini-grid" && !useGrid6 && urls.length >= 4;
  const framePadding = useGrid4 || useGrid6 ? "px-0" : isNarrow ? "px-1" : "px-1.5";
  const layoutClass = useGrid6
    ? "grid grid-cols-2 gap-0"
    : useGrid4
      ? "grid grid-cols-2 gap-0"
      : "flex flex-col gap-0.5";
  const displayUrls = useGrid6 ? urls.slice(0, 6) : useGrid4 ? urls.slice(0, 4) : urls;

  return (
    <div className={`w-full ${framePadding}`}>
      <div className={`items-center ${layoutClass}`}>
        {displayUrls.map((url, index) => (
          <figure
            key={`${url}-${index}`}
            className="relative w-full overflow-hidden"
          >
            {/* Thermal-friendly treatment: monochrome, lifted contrast, subtle grain.
                Filter must live on the <img> (not a wrapper) so html-to-image / SVG
                foreignObject captures include the bitmap; filters on parents often raster blank. */}
            <div
              className="relative w-full overflow-hidden bg-white"
              style={{
                aspectRatio: useGrid4 || useGrid6 ? "1 / 1" : ASPECT_RATIO_STYLE[photoAspect],
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={index === 0 ? alt : `${alt} ${index + 1}`}
                className="absolute inset-0 block h-full w-full origin-center object-cover object-center"
                style={{
                  imageRendering: "auto",
                  filter: `grayscale(1) contrast(${thermal.contrast}) brightness(${thermal.brightness})`,
                }}
                draggable={false}
              />
              <div
                data-receipt-grain
                className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.12]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
                  backgroundSize: "120px 120px",
                }}
                aria-hidden
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
