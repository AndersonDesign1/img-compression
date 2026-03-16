import type {
  CompressionSettings,
  CompressionStrategy,
  OutputFormat,
} from "../utils/types";

async function encodeToPng(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/png");
  return encode(imageData);
}

export async function compressImageData(
  imageData: ImageData,
  settings: CompressionSettings & { format: OutputFormat },
  strategy: CompressionStrategy
): Promise<ArrayBuffer> {
  const format = settings.format;

  if (strategy === "oxipng") {
    // OxiPNG's wasm runtime has been unstable on large browser-side inputs in
    // production, especially for the exact Cloudflare-served path the app uses.
    // We keep PNG export available by falling back to plain PNG encode here.
    return encodeToPng(imageData);
  }

  if (strategy === "png-encode" || format === "png") {
    return encodeToPng(imageData);
  }

  if (format === "webp") {
    const { encode } = await import("@jsquash/webp");
    return encode(imageData, {
      exact: 0,
      near_lossless:
        strategy === "webp-lossless" || settings.lossless ? 100 : 0,
      quality:
        strategy === "webp-lossless" || settings.lossless
          ? 100
          : settings.quality,
    });
  }

  if (format === "avif") {
    const { encode } = await import("@jsquash/avif");
    return encode(imageData, {
      quality: settings.lossless ? 100 : settings.quality,
      speed: 7,
    });
  }

  const { encode } = await import("@jsquash/jpeg");
  return encode(imageData, {
    baseline: false,
    optimize_coding: true,
    quality: settings.quality,
  });
}

export function optimiseSourcePng(
  sourceBuffer: ArrayBuffer,
  _lossless: boolean
): Promise<ArrayBuffer> {
  return Promise.resolve(sourceBuffer);
}
