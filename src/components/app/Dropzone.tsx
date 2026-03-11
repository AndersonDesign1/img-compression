import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}

export function Dropzone({ onFiles, compact = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length) onFiles(files);
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFiles]);

  if (compact) {
    return (
      <button
        type="button"
        className="add-more-btn"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFiles(Array.from(event.dataTransfer.files));
        }}
        data-dragging={isDragging}
      >
        <Icon icon="hugeicons:add-01" width={15} />
        Add files
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = '';
          }}
        />
      </button>
    );
  }

  return (
    <section
      data-dragging={isDragging}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
      className="dropzone-hero"
    >
      <div className="dropzone-icon">
        <Icon icon="hugeicons:image-upload" width={56} />
      </div>

      <h2 className="dropzone-title">Drop PNG or JPEG files here</h2>
      <p className="dropzone-hint">or paste from clipboard</p>

      <button type="button" onClick={() => inputRef.current?.click()} className="dropzone-select-btn">
        <Icon icon="hugeicons:folder-open" width={16} />
        Select Files
      </button>

      <p className="dropzone-paste-hint">
        <kbd>Ctrl+V</kbd> to paste
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = '';
          setIsDragging(false);
        }}
      />
    </section>
  );
}
