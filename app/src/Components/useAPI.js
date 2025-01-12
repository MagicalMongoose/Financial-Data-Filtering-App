// API Fetching & Caching by Claude 3.5 Sonnet

import { useState, useEffect } from "react";

const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

function useAPI(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clean up expired cache entries
    const cleanCache = () => {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    };

    const fetchData = async () => {
      cleanCache(); // Clean cache before checking for cached data

      // Check cache first
      const cachedData = cache.get(url);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setData(cachedData.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Store in cache
        cache.set(url, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        setError(null);
      } catch (error) {
        setError(error.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

export default useAPI;
