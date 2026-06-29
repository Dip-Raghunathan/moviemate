import { useState, useEffect, useRef, useCallback } from 'react';
import client from '../../core/api/client';

// Global in-memory cache and active request registries
const cacheRegistry = new Map();
const pendingRegistry = new Map();

export const useApi = (options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Automatically cancel any active requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (requestConfig = {}) => {
      // 1. Offline check
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const offlineError = new Error('No internet connection. Operating in offline mode.');
        offlineError.isOffline = true;
        if (isMountedRef.current) {
          setError(offlineError);
          setLoading(false);
        }
        throw offlineError;
      }

      const {
        url,
        method = 'GET',
        data: requestBody = null,
        params = {},
        cacheKey: customCacheKey = null,
        useCache = false,
        ttl = 30000, // 30 seconds default cache TTL
        retry = 2,
        retryDelay = 1000,
      } = requestConfig;

      // Build unique key for caching/deduplication
      const cacheKey = customCacheKey || `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(requestBody)}`;

      // 2. Cache Hit check
      if (useCache && method.toUpperCase() === 'GET') {
        const cached = cacheRegistry.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < ttl) {
          setData(cached.data);
          return cached.data;
        }
      }

      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // Abort previous running requests on this hook instance
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const axiosConfig = {
        url,
        method,
        data: requestBody,
        params,
        signal: abortControllerRef.current.signal,
        retry,
        retryDelay,
      };

      // 3. Request Deduplication: check if another identical request is already firing
      let requestPromise = pendingRegistry.get(cacheKey);
      if (!requestPromise) {
        requestPromise = client(axiosConfig)
          .then((res) => {
            pendingRegistry.delete(cacheKey);
            return res.data;
          })
          .catch((err) => {
            pendingRegistry.delete(cacheKey);
            throw err;
          });
        pendingRegistry.set(cacheKey, requestPromise);
      }

      try {
        const responseData = await requestPromise;

        // 4. Save to Cache if needed
        if (useCache && method.toUpperCase() === 'GET') {
          cacheRegistry.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
          });
        }

        if (isMountedRef.current) {
          setData(responseData.data);
          setLoading(false);
        }

        return responseData.data;
      } catch (err) {
        // Don't set error state if request was cancelled manually
        if (err.name === 'CanceledError' || err.message === 'canceled') {
          return null;
        }

        const normalizedError = {
          message: err.response?.data?.message || err.message || 'Request failed',
          errorCode: err.response?.data?.errorCode || 'REQUEST_FAILED',
          details: err.response?.data?.details || null,
          statusCode: err.response?.status || 500,
        };

        if (isMountedRef.current) {
          setError(normalizedError);
          setLoading(false);
        }

        throw normalizedError;
      }
    },
    []
  );

  const clearCache = useCallback((key = null) => {
    if (key) {
      cacheRegistry.delete(key);
    } else {
      cacheRegistry.clear();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    clearCache,
    cancel: () => abortControllerRef.current?.abort(),
  };
};
