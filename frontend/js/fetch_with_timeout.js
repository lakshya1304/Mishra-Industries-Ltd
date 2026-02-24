/**
 * Fetch with timeout to prevent hanging requests
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @param {number} timeout - Timeout in milliseconds (default 15000ms)
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms to ${url}`);
    }
    throw error;
  }
}

/**
 * Fetch with retry logic for resilience
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries (default 2)
 * @param {number} timeout - Request timeout in ms (default 15000ms)
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(
  url,
  options = {},
  retries = 2,
  timeout = 15000,
) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options, timeout);
    } catch (error) {
      lastError = error;
      if (i < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, i) * 1000;
        console.warn(
          `Request failed (attempt ${i + 1}/${retries + 1}), retrying in ${delay}ms...`,
          error.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Replace all fetch calls in page with timeout protection
 * Usage: window.fetch = createSmartFetch()
 */
export function createSmartFetch(timeout = 15000) {
  return function (url, options = {}) {
    return fetchWithTimeout(url, options, timeout);
  };
}
