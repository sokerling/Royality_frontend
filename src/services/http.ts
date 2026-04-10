import { API_BASE_URL } from "../config";
import type { ApiError } from "../types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type QueryValue = string | number | boolean | null | undefined;
type UnauthorizedHandler = () => void;

interface RequestOptions {
  token?: string | null;
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
}

export class ApiRequestError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

let unauthorizedHandler: UnauthorizedHandler | null = null;
let isNotifyingUnauthorized = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  if (!unauthorizedHandler || isNotifyingUnauthorized) return;
  isNotifyingUnauthorized = true;
  try {
    unauthorizedHandler();
  } finally {
    setTimeout(() => {
      isNotifyingUnauthorized = false;
    }, 250);
  }
}

export function handleUnauthorizedResponse(): void {
  notifyUnauthorized();
}

function toErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload;
  }
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as ApiError).detail;
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }
  }
  return fallback;
}

function buildPath(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }

  const queryString = search.toString();
  return queryString ? `${path}?${queryString}` : path;
}

async function parsePayload(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;

  const contentType = response.headers.get("content-type") || "";
  const shouldParseJson = contentType.includes("application/json");
  if (!shouldParseJson) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    token,
    body,
    query,
    headers = {},
  } = options;

  const fullPath = buildPath(path, query);
  const hasAuthToken = Boolean(token);
  const requestHeaders: Record<string, string> = { ...headers };
  const isJsonBody =
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData);

  if (isJsonBody) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${fullPath}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isJsonBody ? JSON.stringify(body) : (body as BodyInit),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Network request failed";
    throw new Error(`${reason}. API: ${API_BASE_URL}${fullPath}`);
  }

  if (response.status === 401 && hasAuthToken) {
    notifyUnauthorized();
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  let payload: unknown;
  try {
    payload = await parsePayload(response);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiRequestError(
      toErrorMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
    );
  }

  return (payload ?? undefined) as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions & { method?: HttpMethod } = {},
): Promise<T> {
  const { method = "GET", ...rest } = options;
  return request<T>(method, path, rest);
}

export const httpClient = {
  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>("GET", path, options);
  },
  post<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>("POST", path, options);
  },
  put<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>("PUT", path, options);
  },
  delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>("DELETE", path, options);
  },
};
