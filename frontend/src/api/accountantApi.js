export const createAccountantApi = (client) => ({
  drivers: {
    list: (params) => client.get('/drivers', params),
    create: (payload) => client.post('/drivers', payload),
    update: (id, payload) => client.patch(`/drivers/${id}`, payload),
    delete: (id) => client.delete(`/drivers/${id}`),
    setStatus: (id, status) => client.patch(`/drivers/${id}/status`, { status }),
    balance: (id) => client.get(`/drivers/${id}/balance`)
  },
  stockRequests: {
    list: (params) => client.get('/stock-requests', params),
    get: (id) => client.get(`/stock-requests/${id}`),
    create: (payload) => client.post('/stock-requests', payload),
    update: (id, payload) => client.patch(`/stock-requests/${id}`, payload),
    complete: (id) => client.post(`/stock-requests/${id}/complete`),
    cancel: (id) => client.post(`/stock-requests/${id}/cancel`)
  },
  payments: {
    list: (params) => client.get('/payments', params),
    create: (payload) => client.post('/payments', payload)
  }
});
