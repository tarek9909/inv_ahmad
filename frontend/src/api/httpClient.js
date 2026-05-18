import { getApiConfig, normalizeBaseUrl } from './config.js';
import { tokenStorage } from './tokenStorage.js';

export class ApiError extends Error {
  constructor({ status, message, errors, response }) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || [];
    this.response = response;
  }
}

const hasBody = (method) => !['GET', 'HEAD'].includes(method.toUpperCase());

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : '';
};

export const createHttpClient = ({ baseUrl, getToken = tokenStorage.get, onUnauthorized } = {}) => {
  const request = async (path, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const token = getToken?.();
    const headers = {
      Accept: 'application/json',
      ...(hasBody(method) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const resolvedBaseUrl = normalizeBaseUrl(baseUrl || getApiConfig().baseUrl);
    const url = `${resolvedBaseUrl}${path}${buildQuery(options.query)}`;
    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: hasBody(method) && options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
    const payload = await readPayload(response);

    if (!response.ok || payload?.success === false) {
      if (response.status === 401) onUnauthorized?.();
      throw new ApiError({
        status: response.status,
        message: payload?.message || response.statusText,
        errors: payload?.errors,
        response: payload
      });
    }

    return {
      data: payload?.data,
      meta: payload?.meta || {},
      message: payload?.message || '',
      raw: payload
    };
  };

  return {
    get: (path, query, options) => request(path, { ...options, method: 'GET', query }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
    request
  };
};

const readPayload = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { success: response.ok, data: text };
  }
};

export const http = createHttpClient();
