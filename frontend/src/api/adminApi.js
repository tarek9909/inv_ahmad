export const createAdminApi = (client) => ({
  users: {
    list: (params) => client.get('/users', params),
    create: (payload) => client.post('/users', payload),
    update: (id, payload) => client.patch(`/users/${id}`, payload),
    setStatus: (id, status) => client.patch(`/users/${id}/status`, { status })
  },
  roles: {
    list: () => client.get('/roles'),
    create: (payload) => client.post('/roles', payload),
    update: (id, payload) => client.patch(`/roles/${id}`, payload),
    getPermissions: (id) => client.get(`/roles/${id}/permissions`),
    updatePermissions: (id, permissions) => client.patch(`/roles/${id}/permissions`, { permissions })
  },
  permissions: {
    list: () => client.get('/permissions')
  },
  auditLogs: {
    list: (params) => client.get('/audit-logs', params)
  }
});
