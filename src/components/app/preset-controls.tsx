import { Icon } from "@iconify/react";
import type { CompressionSettings, OutputFormat } from "../../lib/utils/types";

interface ToolbarControlsProps {
  hasCompleted: boolean;
  hasJobs: boolean;
  hasSelectedOutput: boolean;
  isProcessing: boolean;
  onChange: (settings: CompressionSettings) => void;
  onClear: () => void;
  onDownloadSelected: () => void;
  onDownloadZip: () => void;
  settings: CompressionSettings;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
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
  const losslessSupported =
    settings.format === "png" || settings.format === "webp";

  return (
    <div className="app-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Format</span>
        <div className="format-pills">
          {formats.map((fmt) => (
            <button
              className="format-pill"
              data-active={settings.format === fmt.value}
              key={fmt.value}
              onClick={() =>
                onChange({
                  ...settings,
                  format: fmt.value,
                  lossless:
                    fmt.value === "png" || fmt.value === "webp"
                      ? settings.lossless
                      : false,
                })
              }
              type="button"
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
          className="toolbar-range"
          disabled={settings.lossless}
          max={100}
          min={1}
          onChange={(event) =>
            onChange({ ...settings, quality: Number(event.target.value) })
          }
          type="range"
          value={settings.quality}
        />
        <span className="toolbar-label">Faster</span>
      </div>

      <div className="toolbar-divider" />

      <label className="toolbar-checkbox">
        <input
          checked={settings.lossless}
          disabled={!losslessSupported}
          onChange={(event) =>
            onChange({ ...settings, lossless: event.target.checked })
          }
          type="checkbox"
        />
        <Icon icon="hugeicons:lossless" width={14} />
        Lossless
      </label>
      {!losslessSupported && (
        <span className="toolbar-note">
          Lossless is available for PNG and WebP.
        </span>
      )}

      <div className="toolbar-divider" />

      <div className="toolbar-group toolbar-actions">
        {hasSelectedOutput && (
          <button
            className="toolbar-btn"
            onClick={onDownloadSelected}
            title="Download selected"
            type="button"
          >
            <Icon icon="hugeicons:download-04" width={15} />
            Download
          </button>
        )}
        {hasCompleted && (
          <button
            className="toolbar-btn"
            onClick={onDownloadZip}
            title="Download all as .zip"
            type="button"
          >
            <Icon icon="hugeicons:archive" width={15} />
            .zip
          </button>
        )}
        <button
          className="toolbar-btn"
          disabled={isProcessing || !hasJobs}
          onClick={onClear}
          title="Clear queue"
          type="button"
        >
          <Icon icon="hugeicons:delete-02" width={15} />
        </button>
      </div>
    </div>
  );
}
