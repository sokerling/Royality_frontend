type AbortEvent = {
  type: "abort";
  target: AbortSignalPolyfill;
};

class AbortSignalPolyfill {
  aborted = false;
  reason: unknown = undefined;
  onabort: ((event: AbortEvent) => void) | null = null;

  private listeners = new Set<(event: AbortEvent) => void>();

  addEventListener(type: string, listener: ((event: AbortEvent) => void) | null): void {
    if (type !== "abort" || typeof listener !== "function") return;
    this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: ((event: AbortEvent) => void) | null): void {
    if (type !== "abort" || typeof listener !== "function") return;
    this.listeners.delete(listener);
  }

  dispatchEvent(event: AbortEvent): boolean {
    if (!event || event.type !== "abort") return true;

    for (const listener of this.listeners) {
      try {
        listener.call(this, event);
      } catch {
        // Keep behavior resilient; one broken listener must not block others.
      }
    }

    if (typeof this.onabort === "function") {
      try {
        this.onabort(event);
      } catch {
        // no-op
      }
    }

    return true;
  }

  throwIfAborted(): void {
    if (this.aborted) {
      throw this.reason ?? new Error("AbortError");
    }
  }
}

class AbortControllerPolyfill {
  readonly signal = new AbortSignalPolyfill();

  abort(reason?: unknown): void {
    if (this.signal.aborted) return;
    this.signal.aborted = true;
    this.signal.reason = reason ?? new Error("AbortError");
    this.signal.dispatchEvent({ type: "abort", target: this.signal });
  }
}

const globalRef = globalThis as unknown as {
  AbortController?: typeof AbortControllerPolyfill;
  AbortSignal?: typeof AbortSignalPolyfill;
};

if (typeof globalRef.AbortController === "undefined") {
  globalRef.AbortController = AbortControllerPolyfill;
}

if (typeof globalRef.AbortSignal === "undefined") {
  globalRef.AbortSignal = AbortSignalPolyfill;
}
