/// <reference lib="webworker" />

import { compressImageData } from "../codecs/compress";
import { buildOutputName } from "../utils/filenames";
import { outputExtension, resolveOutputFormat } from "../utils/format";
import type {
  WorkerCompressRequest,
  WorkerCompressResponse,
} from "../utils/types";

function postProgress(
  id: string,
  progress: number,
  stage: "decoding" | "encoding"
) {
  const message: WorkerCompressResponse = {
    id,
    kind: "progress",
    progress,
    stage,
  };
  self.postMessage(message);
}

function mimeTypeForFormat(
  format: WorkerCompressRequest["settings"]["format"]
) {
  if (format === "png") {
    return "image/png";
  }

  if (format === "webp") {
    return "image/webp";
  }

  if (format === "avif") {
    return "image/avif";
  }

  return "image/jpeg";
}

async function fileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to initialize canvas context in worker.");
  }

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return imageData;
}

self.onmessage = async (event: MessageEvent<WorkerCompressRequest>) => {
  const { id, file, settings } = event.data;

  try {
    const outputFormat = resolveOutputFormat(file, settings.format);
    postProgress(id, 20, "decoding");
    const imageData = await fileToImageData(file);
    postProgress(id, 60, "encoding");
    const bytesBuffer = await compressImageData(imageData, {
      ...settings,
      format: outputFormat,
    });
    const requestedExtension = outputExtension(outputFormat);
    const outputName = buildOutputName(file.name, requestedExtension);
    const mime = mimeTypeForFormat(outputFormat);
    const output = new Blob([bytesBuffer], { type: mime });
    const message: WorkerCompressResponse = {
      id,
      kind: "result",
      ok: true,
      output,
      outputName,
    };
    self.postMessage(message);
  } catch (error) {
    const message: WorkerCompressResponse = {
      id,
      kind: "result",
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Compression failed unexpectedly.",
    };
    self.postMessage(message);
  }
};
