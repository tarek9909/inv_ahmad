import { api } from '../api/index.js';
import { createResourceStore } from './createResourceStore.js';

export const createAccountantStores = ({ accountantApi = api.accountant } = {}) => ({
  drivers: {
    ...createResourceStore({ api: accountantApi.drivers }),
    setStatus: accountantApi.drivers.setStatus,
    loadBalance: accountantApi.drivers.balance
  },
  stockRequests: {
    ...createResourceStore({ api: accountantApi.stockRequests }),
    loadOne: accountantApi.stockRequests.get,
    accept: accountantApi.stockRequests.accept,
    complete: accountantApi.stockRequests.complete,
    cancel: accountantApi.stockRequests.cancel,
    print: accountantApi.stockRequests.print
  },
  payments: createResourceStore({ api: accountantApi.payments })
});

export const accountantStores = createAccountantStores();
