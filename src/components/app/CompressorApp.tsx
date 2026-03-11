import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { strToU8, zip } from 'fflate';
import { Dropzone } from './Dropzone';
import { ToolbarControls } from './PresetControls';
import { CompressionList } from './CompressionList';
import { PreviewPanel } from './PreviewPanel';
import { loadSettings, saveSettings } from '../../lib/utils/storage';
import { sanitizeFilename } from '../../lib/utils/filenames';
import type { CompressionJob, CompressionSettings, WorkerCompressResponse } from '../../lib/utils/types';

const defaultSettings: CompressionSettings = {
  format: 'webp',
  quality: 82,
  lossless: false
};

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function uniqueName(original: string, used: Set<string>): string {
  const normalizedOriginal = sanitizeFilename(original, 'image.jpg');

  if (!used.has(normalizedOriginal)) {
    used.add(normalizedOriginal);
    return normalizedOriginal;
  }

  const dotIndex = normalizedOriginal.lastIndexOf('.');
  const base = dotIndex > -1 ? normalizedOriginal.slice(0, dotIndex) : normalizedOriginal;
  const ext = dotIndex > -1 ? normalizedOriginal.slice(dotIndex) : '';

  let count = 1;
  while (used.has(`${base}-${count}${ext}`)) {
    count += 1;
  }

  const next = `${base}-${count}${ext}`;
  used.add(next);
  return next;
}

export default function CompressorApp() {
  const [settings, setSettings] = useState<CompressionSettings>(() => loadSettings() ?? defaultSettings);
  const [jobs, setJobs] = useState<CompressionJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);
  const settingsRef = useRef(settings);

  // Keep ref in sync so the auto-compress callback always uses latest settings
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedId), [jobs, selectedId]);
  const isProcessing = useMemo(() => jobs.some((job) => job.status === 'processing'), [jobs]);
  const hasCompleted = useMemo(() => jobs.some((job) => job.status === 'done'), [jobs]);
  const hasSelectedOutput = !!(selectedJob?.output && selectedJob?.outputName);
  const hasJobs = jobs.length > 0;

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  function ensureWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../lib/workers/compression.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.onmessage = (event: MessageEvent<WorkerCompressResponse>) => {
        setJobs((current) =>
          current.map((job) => {
            if (job.id !== event.data.id) return job;

            if (event.data.kind === 'progress') {
              return { ...job, progress: Math.max(job.progress, event.data.progress) };
            }

            if (!event.data.ok) {
              return { ...job, status: 'error', error: event.data.error, progress: 100 };
            }

            return {
              ...job,
              status: 'done',
              progress: 100,
              output: event.data.output,
              outputName: event.data.outputName
            };
          })
        );
      };
      workerRef.current.onerror = () => {
        setGlobalError('Compression worker failed. Please refresh.');
        setJobs((current) =>
          current.map((job) =>
            job.status === 'processing'
              ? { ...job, status: 'error', error: 'Worker failed.', progress: 100 }
              : job
          )
        );
      };
    }
    return workerRef.current;
  }

  // Compress a set of jobs immediately
  const compressJobs = useCallback((jobsToCompress: CompressionJob[]) => {
    const worker = ensureWorker();
    const currentSettings = settingsRef.current;
    saveSettings(currentSettings);

    setJobs((current) =>
      current.map((job) => {
        const shouldCompress = jobsToCompress.some((j) => j.id === job.id);
        if (!shouldCompress) return job;
        worker.postMessage({ id: job.id, file: job.file, settings: currentSettings });
        return { ...job, status: 'processing', progress: 5, error: undefined, output: undefined, outputName: undefined };
      })
    );
  }, []);

  // Auto-compress: add files and immediately start compression
  function addFiles(files: File[]) {
    const next = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'queued' as const,
        progress: 0
      }));

    if (!next.length) {
      setGlobalError('Please select image files only.');
      return;
    }

    setGlobalError('');
    setJobs((current) => {
      const combined = [...current, ...next];
      setSelectedId((existing) => existing ?? combined[0]?.id ?? null);
      return combined;
    });

    // Auto-compress the newly added files
    setTimeout(() => compressJobs(next), 50);
  }

  function clearQueue() {
    if (isProcessing) return;
    setJobs([]);
    setSelectedId(null);
    setGlobalError('');
  }

  function downloadSelected() {
    if (selectedJob?.output && selectedJob.outputName) {
      downloadBlob(selectedJob.output, selectedJob.outputName);
    }
  }

  async function downloadAllZip() {
    const completed = jobs.filter((job) => job.output && job.outputName);
    if (!completed.length) {
      setGlobalError('No completed files to download.');
      return;
    }

    try {
      const archive: Record<string, Uint8Array> = {
        'README.txt': strToU8('Generated by PixelPress. Compression happened entirely in your browser.')
      };
      const usedNames = new Set<string>(Object.keys(archive));

      for (const job of completed) {
        if (!job.outputName || !job.output) continue;
        const safeName = uniqueName(job.outputName, usedNames);
        archive[safeName] = new Uint8Array(await job.output.arrayBuffer());
      }

      const zipData = await new Promise<Uint8Array>((resolve, reject) => {
        zip(archive, { level: 6 }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });

      const zipBytes = new Uint8Array(zipData.byteLength);
      zipBytes.set(zipData);
      downloadBlob(new Blob([zipBytes], { type: 'application/zip' }), 'pixelpress-compressed.zip');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to create zip archive.');
    }
  }

  // Empty state — fullscreen dropzone
  if (!hasJobs) {
    return (
      <div className="app-shell app-shell--empty">
        <Dropzone onFiles={addFiles} />
        {globalError && <p className="app-error">{globalError}</p>}
        <ToolbarControls
          settings={settings}
          onChange={setSettings}
          onDownloadSelected={downloadSelected}
          onDownloadZip={downloadAllZip}
          onClear={clearQueue}
          isProcessing={isProcessing}
          hasJobs={hasJobs}
          hasCompleted={hasCompleted}
          hasSelectedOutput={hasSelectedOutput}
        />
      </div>
    );
  }

  // Working state — sidebar + preview + toolbar
  return (
    <div className="app-shell app-shell--working">
      <div className="app-body">
        <CompressionList jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="app-content">
          <PreviewPanel job={selectedJob} />
          <Dropzone onFiles={addFiles} compact />
        </div>
      </div>
      {globalError && <p className="app-error">{globalError}</p>}
      <ToolbarControls
        settings={settings}
        onChange={setSettings}
        onDownloadSelected={downloadSelected}
        onDownloadZip={downloadAllZip}
        onClear={clearQueue}
        isProcessing={isProcessing}
        hasJobs={hasJobs}
        hasCompleted={hasCompleted}
        hasSelectedOutput={hasSelectedOutput}
      />
    </div>
  );
}
