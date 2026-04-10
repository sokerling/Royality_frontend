import { isAndroid } from "@nativescript/core";

export function normalizeBackendUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!isAndroid) return url;

  return url.replace(
    /^([a-z]+):\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
    (_match, scheme: string, _host: string, port: string | undefined) =>
      `${scheme}://10.0.2.2${port || ""}`,
  );
}
