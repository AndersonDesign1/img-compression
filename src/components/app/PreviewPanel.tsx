import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { formatBytes } from "../../lib/utils/format";
import type { CompressionJob } from "../../lib/utils/types";

interface PreviewPanelProps {
  job?: CompressionJob;
}

export function PreviewPanel({ job }: PreviewPanelProps) {
  const [view, setView] = useState<"original" | "compressed">("original");
  const originalUrl = useMemo(
    () => (job?.file ? URL.createObjectURL(job.file) : null),
    [job?.file]
  );
  const outputUrl = useMemo(
    () => (job?.output ? URL.createObjectURL(job.output) : null),
    [job?.output]
  );

  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [originalUrl, outputUrl]);

  useEffect(() => {
    if (job?.output) {
      setView("compressed");
    } else {
      setView("original");
    }
  }, [job?.output]);

  if (!job) {
    return (
      <div className="preview-main">
        <div className="preview-empty">
          <Icon className="icon-muted" icon="hugeicons:image-01" width={28} />
          <p>Select a file to preview</p>
        </div>
      </div>
    );
  }

  const ratio = job.output
    ? Math.round((1 - job.output.size / job.file.size) * 100)
    : null;
  const showUrl = view === "compressed" && outputUrl ? outputUrl : originalUrl;

  return (
    <div className="preview-main">
      <div className="preview-topbar">
        <div className="preview-file-info">
          <Icon className="icon-muted" icon="hugeicons:image-02" width={15} />
          <span className="preview-filename">{job.file.name}</span>
          <span className="preview-size">{formatBytes(job.file.size)}</span>
          {job.output && (
            <>
              <Icon
                className="icon-muted"
                icon="hugeicons:arrow-right-01"
                width={13}
              />
              <span className="preview-size">
                {formatBytes(job.output.size)}
              </span>
              {ratio !== null && (
                <span className="preview-savings">-{ratio}%</span>
              )}
            </>
          )}
        </div>
        {job.output && (
          <div className="preview-toggle">
            <button
              className="preview-toggle-btn"
              data-active={view === "original"}
              onClick={() => setView("original")}
              type="button"
            >
              Original
            </button>
            <button
              className="preview-toggle-btn"
              data-active={view === "compressed"}
              onClick={() => setView("compressed")}
              type="button"
            >
              Compressed
            </button>
          </div>
        )}
      </div>

      <div className="preview-canvas">
        {showUrl ? (
          <img
            alt={`${view === "compressed" ? "Compressed" : "Original"} ${job.file.name}`}
            src={showUrl}
          />
        ) : (
          <div className="preview-empty">
            {job.status === "processing" ? (
              <>
                <Icon
                  className="spin icon-accent"
                  icon="hugeicons:loading-03"
                  width={24}
                />
                <p>Compressing…</p>
              </>
            ) : (
              <p>Waiting for compression</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
