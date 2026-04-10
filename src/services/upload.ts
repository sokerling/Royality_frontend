import * as bgHttp from "@nativescript/background-http";
import { Application } from "@nativescript/core";
import { API_BASE_URL } from "../config";
import type { ApiError } from "../types/api";
import { handleUnauthorizedResponse } from "./http";
import { runWithXState } from "./xstateRequest";

interface MultipartUploadOptions {
  sessionName: string;
  path: string;
  token: string;
  params: Array<any>;
  description?: string;
}

function parseJson(data: string | null | undefined): unknown {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function toErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as ApiError).detail;
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }
  }
  return fallback;
}

function getAndroidNotificationChannelId(): string | undefined {
  if (typeof android === "undefined") return undefined;
  const context = Application.android?.context;
  if (!context) return undefined;
  return String(context.getPackageName());
}

export function multipartUpload<T>(options: MultipartUploadOptions): Promise<T> {
  return runWithXState(async (payload: MultipartUploadOptions) => {
    const session = bgHttp.session(payload.sessionName);
    const request: bgHttp.Request = {
      url: `${API_BASE_URL}${payload.path}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
      description: payload.description || "File upload",
      androidNotificationChannelID: getAndroidNotificationChannelId(),
      androidAutoClearNotification: true,
    };

    return new Promise<T>((resolve, reject) => {
      const task = session.multipartUpload(payload.params, request);

      task.on("error", (event) => {
        const message = event.error?.message || "Upload failed.";
        reject(new Error(message));
      });

      task.on("responded", (event) => {
        const responsePayload = parseJson(event.data);

        if (event.responseCode === 401) {
          handleUnauthorizedResponse();
        }

        if (event.responseCode >= 200 && event.responseCode < 300) {
          resolve((responsePayload ?? undefined) as T);
          return;
        }

        const fallback = `Upload failed: HTTP ${event.responseCode}`;
        reject(new Error(toErrorMessage(responsePayload, fallback)));
      });
    });
  }, options);
}
