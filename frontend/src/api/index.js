import { createHttpClient, http } from './httpClient.js';
import { createAuthApi } from './authApi.js';
import { createAdminApi } from './adminApi.js';
import { createInventoryApi } from './inventoryApi.js';
import { createAccountantApi } from './accountantApi.js';
import { createReportsApi } from './reportsApi.js';

export * from './config.js';
export * from './httpClient.js';
export * from './tokenStorage.js';

export const createApi = (client = http) => ({
  auth: createAuthApi(client),
  admin: createAdminApi(client),
  inventory: createInventoryApi(client),
  accountant: createAccountantApi(client),
  reports: createReportsApi(client)
});

export const api = createApi(http);
export { createHttpClient };
