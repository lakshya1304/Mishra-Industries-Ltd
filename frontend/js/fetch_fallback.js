// Fetch fallback helper: try local backend first, then fallback to remote deployment.
(function () {
  const REMOTE = "https://mishra-industries-ltd-yjfr.onrender.com";
  const LOCAL = "http://localhost:5000";
  const originalFetch = window.fetch.bind(window);

  // Expose for other scripts if needed
  window.__MISHRA_BACKENDS = { REMOTE, LOCAL };

  window.fetch = async function (input, init) {
    try {
      let url = typeof input === "string" ? input : input?.url || "";

      // If caller passed a Request object or absolute URL that points to REMOTE,
      // try the equivalent LOCAL URL first, then fallback to the original.
      if (typeof url === "string" && url.includes(REMOTE)) {
        const localUrl = url.replace(REMOTE, LOCAL);
        try {
          const r = await originalFetch(localUrl, init);
          if (r.ok) return r;
        } catch (e) {
          /* ignore and fallback */
        }
        return originalFetch(url, init);
      }

      // If URL is relative and starts with /api, try LOCAL then REMOTE
      if (
        typeof url === "string" &&
        (url.startsWith("/api") || url.startsWith("api/"))
      ) {
        const localUrl = LOCAL + (url.startsWith("/") ? url : "/" + url);
        try {
          const r = await originalFetch(localUrl, init);
          if (r.ok) return r;
        } catch (e) {
          /* ignore */
        }
        const remoteUrl = REMOTE + (url.startsWith("/") ? url : "/" + url);
        return originalFetch(remoteUrl, init);
      }

      // Otherwise use the original fetch behavior
      return originalFetch(input, init);
    } catch (err) {
      // In very rare cases fall back to original fetch
      return originalFetch(input, init);
    }
  };
})();
