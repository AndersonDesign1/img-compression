/// <reference lib="webworker" />

import { compressImageData } from '../codecs/compress';
import type { WorkerCompressRequest, WorkerCompressResponse } from '../utils/types';
import { outputExtension } from '../utils/format';

async function fileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to initialize canvas context in worker.');
  }

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return imageData;
}

self.onmessage = async (event: MessageEvent<WorkerCompressRequest>) => {
  const { id, file, settings } = event.data;

  try {
    const imageData = await fileToImageData(file);
    const bytesBuffer = await compressImageData(imageData, settings);
    const extension = outputExtension(settings.format, file.name.split('.').pop() ?? 'jpg');
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const outputName = `${baseName}.${extension}`;
    const mime = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : extension === 'avif' ? 'image/avif' : 'image/jpeg';
    const output = new Blob([bytesBuffer], { type: mime });
    const message: WorkerCompressResponse = { id, ok: true, output, outputName };
    self.postMessage(message);
  } catch (error) {
    const message: WorkerCompressResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : 'Compression failed unexpectedly.'
    };
    self.postMessage(message);
  }
};
