import { Icon } from '@iconify/react';
import type { CompressionSettings, OutputFormat } from '../../lib/utils/types';

interface ToolbarControlsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  onDownloadSelected: () => void;
  onDownloadZip: () => void;
  onClear: () => void;
  isProcessing: boolean;
  hasJobs: boolean;
  hasCompleted: boolean;
  hasSelectedOutput: boolean;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

export function ToolbarControls({
  settings,
  onChange,
  onDownloadSelected,
  onDownloadZip,
  onClear,
  isProcessing,
  hasJobs,
  hasCompleted,
  hasSelectedOutput,
}: ToolbarControlsProps) {
  return (
    <div className="app-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Format</span>
        <div className="format-pills">
          {formats.map((fmt) => (
            <button
              key={fmt.value}
              type="button"
              className="format-pill"
              data-active={settings.format === fmt.value}
              onClick={() => onChange({ ...settings, format: fmt.value })}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group toolbar-slider-group">
        <span className="toolbar-label">Smaller</span>
        <input
          type="range"
          className="toolbar-range"
          min={1}
          max={100}
          value={settings.quality}
          disabled={settings.lossless}
          onChange={(event) => onChange({ ...settings, quality: Number(event.target.value) })}
        />
        <span className="toolbar-label">Faster</span>
      </div>

      <div className="toolbar-divider" />

      <label className="toolbar-checkbox">
        <input
          type="checkbox"
          checked={settings.lossless}
          onChange={(event) => onChange({ ...settings, lossless: event.target.checked })}
        />
        <Icon icon="hugeicons:lossless" width={14} />
        Lossless
      </label>

      <div className="toolbar-divider" />

      <div className="toolbar-group toolbar-actions">
        {hasSelectedOutput && (
          <button type="button" className="toolbar-btn" onClick={onDownloadSelected} title="Download selected">
            <Icon icon="hugeicons:download-04" width={15} />
            Download
          </button>
        )}
        {hasCompleted && (
          <button type="button" className="toolbar-btn" onClick={onDownloadZip} title="Download all as .zip">
            <Icon icon="hugeicons:archive" width={15} />
            .zip
          </button>
        )}
        <button type="button" className="toolbar-btn" disabled={isProcessing || !hasJobs} onClick={onClear} title="Clear queue">
          <Icon icon="hugeicons:delete-02" width={15} />
        </button>
      </div>
    </div>
  );
}
