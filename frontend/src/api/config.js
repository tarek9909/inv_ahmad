export const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

let runtimeConfig = {
  baseUrl: import.meta.env?.VITE_API_BASE_URL || globalThis?.__STOCK_DRIVER_API_BASE_URL__ || DEFAULT_API_BASE_URL
};

export const getApiConfig = () => ({ ...runtimeConfig });

export const configureApi = (config = {}) => {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
    baseUrl: normalizeBaseUrl(config.baseUrl || runtimeConfig.baseUrl)
  };
  return getApiConfig();
};

export const normalizeBaseUrl = (baseUrl) => String(baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
