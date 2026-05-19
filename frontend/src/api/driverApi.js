export const createDriverApi = (client) => ({
  me: () => client.get('/driver/me'),
  stockRequests: {
    list: () => client.get('/driver/stock-requests'),
    get: (id) => client.get(`/driver/stock-requests/${id}`)
  }
});
