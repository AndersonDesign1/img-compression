import { Icon } from "@iconify/react";
import { formatBytes } from "../../lib/utils/format";
import type { CompressionJob } from "../../lib/utils/types";

interface CompressionListProps {
  jobs: CompressionJob[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

function statusIcon(status: string, error?: string) {
  switch (status) {
    case "queued":
      return (
        <Icon className="icon-muted" icon="hugeicons:time-02" width={14} />
      );
    case "processing":
      return (
        <Icon
          className="spin icon-accent"
          icon="hugeicons:loading-03"
          width={14}
        />
      );
    case "done":
      return (
        <Icon
          className="icon-success"
          icon="hugeicons:checkmark-circle-02"
          width={14}
        />
      );
    case "error":
      return (
        <Icon
          className="icon-error"
          icon="hugeicons:alert-circle"
          title={error}
          width={14}
        />
      );
    default:
      return null;
  }
}

export function CompressionList({
  jobs,
  selectedId,
  onSelect,
}: CompressionListProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Files</span>
        <span className="sidebar-count">{jobs.length}</span>
      </div>
      <div className="sidebar-list">
        {jobs.map((job) => {
          const ratio = job.output
            ? Math.round((1 - job.output.size / job.file.size) * 100)
            : null;
          return (
            <button
              className={`sidebar-item ${selectedId === job.id ? "is-active" : ""}`}
              key={job.id}
              onClick={() => onSelect(job.id)}
              type="button"
            >
              <div className="sidebar-item-row">
                {statusIcon(job.status, job.error)}
                <span className="sidebar-item-name">{job.file.name}</span>
              </div>
              <div className="sidebar-item-meta">
                <span>{formatBytes(job.file.size)}</span>
                {job.output && ratio !== null && (
                  <span className="sidebar-savings">-{ratio}%</span>
                )}
              </div>
              {job.error ? (
                <p className="sidebar-item-error">{job.error}</p>
              ) : null}
              {job.status === "processing" && (
                <div className="sidebar-progress">
                  <div
                    className="sidebar-progress-value"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
