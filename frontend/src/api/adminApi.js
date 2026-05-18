export const createAdminApi = (client) => ({
  users: {
    list: (params) => client.get('/users', params),
    create: (payload) => client.post('/users', payload),
    update: (id, payload) => client.patch(`/users/${id}`, payload),
    setStatus: (id, status) => client.patch(`/users/${id}/status`, { status })
  },
  roles: {
    list: () => client.get('/roles')
  },
  auditLogs: {
    list: (params) => client.get('/audit-logs', params)
  }
});
