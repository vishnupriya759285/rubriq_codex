export type ApiErrorStatus =
  | 0
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: ApiErrorStatus,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function toApiErrorStatus(status: number): ApiErrorStatus {
  switch (status) {
    case 400:
    case 401:
    case 403:
    case 404:
    case 409:
    case 422:
    case 429:
    case 500:
    case 502:
    case 503:
      return status;
    default:
      return 0;
  }
}

export function csrfHeaders(): Record<string, string> {
  const csrf = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("rubriq_csrf="))
    ?.split("=", 2)[1];
  return csrf ? { "X-CSRF-Token": decodeURIComponent(csrf) } : {};
}

async function request<T>(
  path: `/api/${string}`,
  init?: RequestInit,
): Promise<T> {
  try {
    const headers = new Headers(init?.headers);
    if (init?.method && !["GET", "HEAD", "OPTIONS"].includes(init.method)) {
      for (const [name, value] of Object.entries(csrfHeaders()))
        headers.set(name, value);
    }
    const response = await fetch(path, {
      ...init,
      headers,
      credentials: "include",
    });
    if (response.ok) {
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    }

    const body = await response.json().catch(() => null);
    let errorMessage = "The request could not be completed.";
    if (typeof body?.detail === "string") {
      errorMessage = body.detail;
    } else if (Array.isArray(body?.detail)) {
      errorMessage = body.detail
        .map((err: any) => err.msg || err.message || JSON.stringify(err))
        .join(". ");
    } else if (typeof body?.detail === "object" && body?.detail !== null) {
      errorMessage = JSON.stringify(body.detail);
    } else if (body?.message) {
      errorMessage = String(body.message);
    }

    throw new ApiError(
      errorMessage,
      toApiErrorStatus(response.status),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach Rubriq. Please try again.", 0);
  }
}

export const api = {
  get: <T>(path: `/api/${string}`) => request<T>(path),
  post: <T>(path: `/api/${string}`, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    }),
  patch: <T>(path: `/api/${string}`, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: <T>(path: `/api/${string}`, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  delete: <T>(path: `/api/${string}`) => request<T>(path, { method: "DELETE" }),
  request,
};
