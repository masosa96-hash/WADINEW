export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<Response> => {
  try {
    const res = await fetch(url, options);

    // Check for success
    if (res.ok) return res;

    // Retry on Rate Limit (429) or Server Error (5xx)
    if (retries > 0 && (res.status === 429 || res.status >= 500)) {
      console.warn(
        `Retrying ${url} (${res.status})... Attempts left: ${retries}`
      );
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    return res;
  } catch (error) {
    // Network errors (fetch throws)
    if (retries > 0) {
      console.warn(
        `Network error for ${url}. Retrying... Attempts left: ${retries}`
      );
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};
