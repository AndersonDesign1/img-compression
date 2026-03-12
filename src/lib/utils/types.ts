export type OutputFormat = "jpeg" | "png" | "webp" | "avif";
export type FormatPreference = "original" | OutputFormat;

export interface CompressionPreset {
  description: string;
  id: string;
  label: string;
  settings: CompressionSettings;
}

export interface CompressionSettings {
  format: FormatPreference;
  lossless: boolean;
  quality: number;
}

export type JobStatus = "queued" | "processing" | "done" | "error";

export interface CompressionJob {
  error?: string;
  file: File;
  id: string;
  output?: Blob;
  outputName?: string;
  progress: number;
  status: JobStatus;
}

export interface WorkerCompressRequest {
  file: File;
  id: string;
  settings: CompressionSettings;
}

export type WorkerProgressStage = "decoding" | "encoding";

export interface WorkerCompressProgress {
  id: string;
  kind: "progress";
  progress: number;
  stage: WorkerProgressStage;
}

export interface WorkerCompressSuccess {
  id: string;
  kind: "result";
  ok: true;
  output: Blob;
  outputName: string;
}

export interface WorkerCompressError {
  error: string;
  id: string;
  kind: "result";
  ok: false;
}

export type WorkerCompressResponse =
  | WorkerCompressProgress
  | WorkerCompressSuccess
  | WorkerCompressError;
