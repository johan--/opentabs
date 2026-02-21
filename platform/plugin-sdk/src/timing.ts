// ---------------------------------------------------------------------------
// Retry / timing utilities for plugin authors
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Delay between attempts in milliseconds (default: 1000) */
  delay?: number;
  /** Use exponential backoff — doubles the delay after each attempt (default: false) */
  backoff?: boolean;
  /** AbortSignal to cancel retries early */
  signal?: AbortSignal;
}

export interface WaitUntilOptions {
  /** Polling interval in milliseconds (default: 200) */
  interval?: number;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
}

/**
 * Retries `fn` on failure up to `maxAttempts` times. Waits `delay` ms between
 * attempts (doubled each time when `backoff` is true). Re-throws the last
 * error after all attempts are exhausted. Supports cancellation via AbortSignal.
 */
export const retry = async <T>(fn: () => Promise<T>, opts?: RetryOptions): Promise<T> => {
  const maxAttempts = opts?.maxAttempts ?? 3;
  const baseDelay = opts?.delay ?? 1_000;
  const backoff = opts?.backoff ?? false;
  const signal = opts?.signal;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw signal.reason instanceof Error ? signal.reason : new Error('retry: aborted');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts) {
      if (signal?.aborted) {
        throw signal.reason instanceof Error ? signal.reason : new Error('retry: aborted');
      }
      const currentDelay = backoff ? baseDelay * 2 ** (attempt - 1) : baseDelay;
      await sleep(currentDelay);
    }
  }

  throw lastError;
};

/**
 * Returns a promise that resolves after `ms` milliseconds.
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Polls `predicate` at `interval` ms until it returns `true`, or rejects on
 * timeout with a descriptive error.
 */
export const waitUntil = (predicate: () => boolean | Promise<boolean>, opts?: WaitUntilOptions): Promise<void> => {
  const interval = opts?.interval ?? 200;
  const timeout = opts?.timeout ?? 10_000;

  return new Promise<void>((resolve, reject) => {
    const state = { settled: false };

    const cleanup = () => {
      state.settled = true;
      clearTimeout(timer);
      clearInterval(poller);
    };

    const timer = setTimeout(() => {
      if (state.settled) return;
      cleanup();
      reject(new Error(`waitUntil: timed out after ${timeout}ms waiting for predicate to return true`));
    }, timeout);

    const check = async () => {
      if (state.settled) return;
      try {
        const result = await predicate();
        if (result) {
          cleanup();
          resolve();
        }
      } catch {
        // Predicate threw — keep polling until timeout
      }
    };

    const poller = setInterval(() => void check(), interval);

    // Check immediately on first call
    void check();
  });
};
