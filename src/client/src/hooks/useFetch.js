import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

/**
 * General-purpose data fetching hook.
 * @param {string|null} path - API path, e.g. "/api/hospitals?state=CA"
 *   Pass null to skip the request (e.g. waiting for user input).
 * @returns {{ data, loading, error }}
 */
export default function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // path is null — skip request
    if (!path) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}${path}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        // Aborts from cleanup are not real errors
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Cleanup: cancel in-flight request when path changes or component unmounts
    return () => controller.abort();
  }, [path]);

  return { data, loading, error };
}