import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

interface DropzoneProps {
  compact?: boolean;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ onFiles, compact = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length) {
        onFiles(files);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      const isEditable =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName));

      if (isEditable || !isModifierPressed) {
        return;
      }

      if (event.key.toLowerCase() === "o") {
        event.preventDefault();
        inputRef.current?.click();
      }
    }

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [onFiles]);

  if (compact) {
    return (
      <button
        className="add-more-btn"
        data-dragging={isDragging}
        onClick={() => inputRef.current?.click()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (
            event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            return;
          }
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFiles(Array.from(event.dataTransfer.files));
        }}
        type="button"
      >
        <Icon icon="hugeicons:add-01" width={15} />
        Add files
        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
          ref={inputRef}
          type="file"
        />
      </button>
    );
  }

  return (
    <section
      className="dropzone-hero"
      data-dragging={isDragging}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setIsDragging(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <div className="dropzone-icon">
        <Icon icon="hugeicons:image-upload" width={56} />
      </div>

      <h2 className="dropzone-title">Drop images here</h2>
      <p className="dropzone-hint">or paste from clipboard</p>

      <button
        className="dropzone-select-btn"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <Icon icon="hugeicons:folder-open" width={16} />
        Select Files
        <span className="shortcut-chip">
          <Icon icon="hugeicons:command" width={15} />
          <kbd>O</kbd>
        </span>
      </button>

      <p className="dropzone-paste-hint">
        <span className="shortcut-chip">
          <Icon icon="hugeicons:command" width={15} />
          <kbd>V</kbd>
        </span>{" "}
        to paste
      </p>

      <input
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
          setIsDragging(false);
        }}
        ref={inputRef}
        type="file"
      />
    </section>
  );
}
