/**
 * Guest-facing back camera mode: primary (≈1×) vs ultra-wide (≈0.5×–0.6× FOV).
 * Selection is done with `deviceId` after enumerateDevices (labels require prior permission).
 */
export type BackLens = "normal" | "wide06";

function lower(s: string) {
  return s.toLowerCase();
}

function isFrontCameraLabel(label: string) {
  return /front|face|user|selfie|true\s*depth|iris/i.test(lower(label));
}

function isTelephotoLabel(label: string) {
  const l = lower(label);
  return (
    /\btele(photo)?\b/i.test(l) ||
    (/\b\d+(\.\d+)?\s*x\b/.test(l) && /back|rear/i.test(l) && !/ultra/i.test(l))
  );
}

function isUltraWideLabel(label: string) {
  const l = lower(label);
  if (isFrontCameraLabel(label) || isTelephotoLabel(label)) return false;
  if (l.includes("ultra") && (l.includes("wide") || l.includes("angle"))) return true;
  if (/\b0\.5x\b|\b0\.6x\b|\b0\.7x\b/i.test(label)) return true;
  if (l.includes("ultrawide") || l.includes("ultra wide")) return true;
  if (l.includes("dual wide") && l.includes("ultra")) return true;
  return false;
}

/**
 * Picks deviceIds for the main back wide camera and the ultra-wide (0.5×–0.6×) camera when the OS exposes distinct labels.
 * Returns nulls when labels are missing or only one back camera is reported.
 */
export function inferBackCamerasFromDevices(
  devices: readonly MediaDeviceInfo[],
): { normal: string | null; ultraWide: string | null } {
  const inputs = devices.filter((d) => d.kind === "videoinput");
  const labeled: { id: string; label: string }[] = [];
  for (const d of inputs) {
    if (!d.label || !d.label.trim()) continue;
    if (isFrontCameraLabel(d.label)) continue;
    labeled.push({ id: d.deviceId, label: d.label });
  }

  let ultraWide: string | null = null;
  for (const { id, label } of labeled) {
    if (isUltraWideLabel(label)) {
      ultraWide = id;
      break;
    }
  }

  let normal: string | null = null;
  for (const { id, label } of labeled) {
    if (id === ultraWide) continue;
    if (isUltraWideLabel(label)) continue;
    if (isTelephotoLabel(label)) continue;
    normal = id;
    break;
  }

  if (!normal && ultraWide && labeled.length >= 2) {
    for (const { id, label } of labeled) {
      if (id !== ultraWide && !isTelephotoLabel(label)) {
        normal = id;
        break;
      }
    }
  }

  return { normal, ultraWide };
}
