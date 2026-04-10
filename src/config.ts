import { isAndroid } from "@nativescript/core";

const fallbackBaseUrl = "http://localhost:8000/api/v1";

declare const process: {
  env?: Record<string, string | undefined>;
};

function normalizeBaseUrl(url: string): string {
  // In Android emulator localhost points to emulator itself, not host machine.
  if (!isAndroid) return url;
  return url
    .replace("http://localhost:", "http://10.0.2.2:")
    .replace("http://127.0.0.1:", "http://10.0.2.2:");
}

export const API_BASE_URL = normalizeBaseUrl(
  process?.env?.API_BASE_URL?.trim() || fallbackBaseUrl,
);
