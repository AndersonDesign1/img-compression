import type { CompressionSettings, FormatPreference } from "./types";

const STORAGE_KEY = "pixelpress:last-settings:v2";
const validFormats: FormatPreference[] = [
  "original",
  "jpeg",
  "png",
  "webp",
  "avif",
];

function isValidSettings(value: unknown): value is CompressionSettings {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<CompressionSettings>;
  return (
    typeof candidate.quality === "number" &&
    candidate.quality >= 1 &&
    candidate.quality <= 100 &&
    typeof candidate.format === "string" &&
    validFormats.includes(candidate.format as FormatPreference) &&
    typeof candidate.lossless === "boolean"
  );
}

export function loadSettings(): CompressionSettings | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    return isValidSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings: CompressionSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
