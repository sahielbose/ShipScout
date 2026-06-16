// Retry helper for GitHub API calls (CONTEXT.md section 11).
// Handles primary rate limits (HTTP 403/429 with rate-limit headers), secondary
// rate limits (abuse detection), and transient 5xx errors with exponential
// backoff plus jitter. Pure and side-effect free: it only sleeps and re-invokes
// the passed function. Non-retryable errors are re-thrown unchanged.
//
// No em dashes, no emojis (per CONTEXT.md section 0).

export interface BackoffOptions {
  // Maximum number of retries (the initial attempt is not counted).
  maxRetries?: number;
  // Base delay in milliseconds for the first backoff.
  baseMs?: number;
  // Exponential growth factor between attempts.
  factor?: number;
  // Hard cap on any single sleep, in milliseconds.
  capMs?: number;
  // Injectable sleep, mainly for tests. Defaults to a real timer.
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULTS: Required<Omit<BackoffOptions, "sleep">> = {
  maxRetries: 5,
  baseMs: 500,
  factor: 2,
  capMs: 30_000,
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Shape of the bits of an Octokit / fetch style error we care about. The thrown
// values are not strongly typed, so we read defensively.
interface HttpLikeError {
  status?: number;
  response?: {
    status?: number;
    headers?: Record<string, string | number | undefined>;
  };
  headers?: Record<string, string | number | undefined>;
  message?: string;
}

function asHttpError(err: unknown): HttpLikeError {
  if (typeof err === "object" && err !== null) {
    return err as HttpLikeError;
  }
  return {};
}

function getStatus(err: HttpLikeError): number | undefined {
  return err.status ?? err.response?.status;
}

function getHeaders(err: HttpLikeError): Record<string, string | number | undefined> {
  return err.response?.headers ?? err.headers ?? {};
}

function headerNumber(
  headers: Record<string, string | number | undefined>,
  name: string,
): number | undefined {
  // Header lookups are case-insensitive in HTTP; Octokit lower-cases them, but
  // be defensive and check both forms.
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (raw === undefined || raw === null) return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

// Detect a secondary (abuse) rate limit, which GitHub signals via the response
// body or a "retry-after" header rather than the standard remaining counter.
function isSecondaryRateLimit(
  err: HttpLikeError,
  headers: Record<string, string | number | undefined>,
): boolean {
  const msg = (err.message ?? "").toLowerCase();
  if (msg.includes("secondary rate limit") || msg.includes("abuse")) return true;
  return headerNumber(headers, "retry-after") !== undefined;
}

// Decide whether an error is worth retrying and, if so, how long to wait before
// the given attempt (0-based). Returns null when the error is not retryable.
function computeDelayMs(
  err: HttpLikeError,
  attempt: number,
  opts: Required<Omit<BackoffOptions, "sleep">>,
): number | null {
  const status = getStatus(err);
  if (status === undefined) return null;

  const headers = getHeaders(err);

  // 5xx: transient server side, always retry with plain backoff.
  const isServerError = status >= 500 && status <= 599;

  // 403 / 429: could be a rate limit. Confirm via headers so we do not retry a
  // genuine permission denial (a 403 with no rate-limit signal).
  const remaining = headerNumber(headers, "x-ratelimit-remaining");
  const isPrimaryRateLimited =
    (status === 403 || status === 429) && remaining === 0;
  const isSecondary =
    (status === 403 || status === 429) && isSecondaryRateLimit(err, headers);

  if (!isServerError && !isPrimaryRateLimited && !isSecondary) {
    return null;
  }

  // Exponential backoff with full jitter, capped.
  const exp = opts.baseMs * Math.pow(opts.factor, attempt);
  const jittered = Math.random() * Math.min(exp, opts.capMs);
  let delay = Math.min(jittered, opts.capMs);

  // Honor an explicit server hint when present. "retry-after" is in seconds.
  const retryAfter = headerNumber(headers, "retry-after");
  if (retryAfter !== undefined) {
    delay = Math.max(delay, Math.min(retryAfter * 1000, opts.capMs));
  } else if (isPrimaryRateLimited) {
    // "x-ratelimit-reset" is a UTC epoch in seconds; wait until the window resets.
    const reset = headerNumber(headers, "x-ratelimit-reset");
    if (reset !== undefined) {
      const waitMs = reset * 1000 - Date.now();
      if (waitMs > 0) {
        delay = Math.max(delay, Math.min(waitMs, opts.capMs));
      }
    }
  }

  return delay;
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts?: BackoffOptions,
): Promise<T> {
  const cfg: Required<Omit<BackoffOptions, "sleep">> = {
    maxRetries: opts?.maxRetries ?? DEFAULTS.maxRetries,
    baseMs: opts?.baseMs ?? DEFAULTS.baseMs,
    factor: opts?.factor ?? DEFAULTS.factor,
    capMs: opts?.capMs ?? DEFAULTS.capMs,
  };
  const sleep = opts?.sleep ?? defaultSleep;

  let attempt = 0;
  // The loop runs (maxRetries + 1) times at most: one initial try plus retries.
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= cfg.maxRetries) throw err;
      const delay = computeDelayMs(asHttpError(err), attempt, cfg);
      if (delay === null) throw err;
      await sleep(delay);
      attempt += 1;
    }
  }
}
