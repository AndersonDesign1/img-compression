import { Icon } from '@iconify/react';
import { formatBytes } from '../../lib/utils/format';
import type { CompressionJob } from '../../lib/utils/types';

interface CompressionListProps {
  jobs: CompressionJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function statusIcon(status: string) {
  switch (status) {
    case 'queued':
      return <Icon icon="hugeicons:time-02" width={14} className="icon-muted" />;
    case 'processing':
      return <Icon icon="hugeicons:loading-03" width={14} className="spin icon-accent" />;
    case 'done':
      return <Icon icon="hugeicons:checkmark-circle-02" width={14} className="icon-success" />;
    case 'error':
      return <Icon icon="hugeicons:alert-circle" width={14} className="icon-error" />;
    default:
      return null;
  }
}

export function CompressionList({ jobs, selectedId, onSelect }: CompressionListProps) {
  if (jobs.length === 0) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Files</span>
        <span className="sidebar-count">{jobs.length}</span>
      </div>
      <div className="sidebar-list">
        {jobs.map((job) => {
          const ratio = job.output ? Math.round((1 - job.output.size / job.file.size) * 100) : null;
          return (
            <button
              key={job.id}
              type="button"
              className={`sidebar-item ${selectedId === job.id ? 'is-active' : ''}`}
              onClick={() => onSelect(job.id)}
            >
              <div className="sidebar-item-row">
                {statusIcon(job.status)}
                <span className="sidebar-item-name">{job.file.name}</span>
              </div>
              <div className="sidebar-item-meta">
                <span>{formatBytes(job.file.size)}</span>
                {job.output && ratio !== null && <span className="sidebar-savings">-{ratio}%</span>}
              </div>
              {job.status === 'processing' && (
                <div className="sidebar-progress">
                  <div className="sidebar-progress-value" style={{ width: `${job.progress}%` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
