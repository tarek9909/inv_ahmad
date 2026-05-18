import { api } from '../api/index.js';
import { createReadOnlyResourceStore, createResourceStore } from './createResourceStore.js';

export const createAdminStores = ({ adminApi = api.admin } = {}) => ({
  users: {
    ...createResourceStore({ api: adminApi.users }),
    setStatus: (id, status) => adminApi.users.setStatus(id, status)
  },
  roles: createReferenceStore(adminApi.roles.list),
  auditLogs: createReadOnlyResourceStore({ api: { list: adminApi.auditLogs.list } })
});

const createReferenceStore = (loader) => {
  const store = createReadOnlyResourceStore({ api: { list: loader } });
  return {
    ...store,
    load: () => store.load()
  };
};

export const adminStores = createAdminStores();
