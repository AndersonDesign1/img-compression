import type { CompressionSettings } from './types';

const STORAGE_KEY = 'pixelpress:last-settings:v1';

export function loadSettings(): CompressionSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompressionSettings;
  } catch {
    return null;
  }
}

export function saveSettings(settings: CompressionSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
