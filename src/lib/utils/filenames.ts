const WHITESPACE_PATTERN = /\s+/g;
const EDGE_DOT_PATTERN = /^[.\s]+|[.\s]+$/g;
const EXTENSION_PATTERN = /\.[^.]+$/;
const LEADING_DOT_PATTERN = /^\./;
const RESERVED_FILENAME_CHARS = '<>:"/\\|?*';

function replaceInvalidFilenameChars(value: string) {
  return Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    return RESERVED_FILENAME_CHARS.includes(char) || code < 32 ? "-" : char;
  }).join("");
}

export function sanitizeFilename(name: string, fallback = "image"): string {
  const trimmed = replaceInvalidFilenameChars(name.trim());
  const collapsed = trimmed.replace(WHITESPACE_PATTERN, " ");
  const safe = collapsed.replace(EDGE_DOT_PATTERN, "");
  return safe.length > 0 ? safe : fallback;
}

export function buildOutputName(
  originalName: string,
  extension: string
): string {
  const safeOriginal = sanitizeFilename(originalName, "image");
  const base = safeOriginal.replace(EXTENSION_PATTERN, "") || "image";
  const safeExt = sanitizeFilename(
    extension.replace(LEADING_DOT_PATTERN, ""),
    "jpg"
  ).toLowerCase();
  return `${base}.${safeExt}`;
}
