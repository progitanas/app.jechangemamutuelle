export async function cloudflareApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiToken = process.env.API_BEARER_TOKEN;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.CLOUDFLARE_API_TIMEOUT_MS || 12000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        ...(init?.headers || {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Cloudflare API timeout after ${timeoutMs}ms`);
    }
    throw new Error("Cloudflare API unreachable");
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error || "Cloudflare API error",
    );
  }

  return data as T;
}
