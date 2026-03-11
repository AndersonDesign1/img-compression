export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export interface CompressionPreset {
  id: string;
  label: string;
  description: string;
  settings: CompressionSettings;
}

export interface CompressionSettings {
  format: OutputFormat;
  quality: number;
  stripMetadata: boolean;
}

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface CompressionJob {
  id: string;
  file: File;
  status: JobStatus;
  progress: number;
  error?: string;
  output?: Blob;
  outputName?: string;
}

export interface WorkerCompressRequest {
  id: string;
  file: File;
  settings: CompressionSettings;
}

export interface WorkerCompressSuccess {
  id: string;
  ok: true;
  output: Blob;
  outputName: string;
}

export interface WorkerCompressError {
  id: string;
  ok: false;
  error: string;
}

export type WorkerCompressResponse = WorkerCompressSuccess | WorkerCompressError;
