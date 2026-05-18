export const createReportsApi = (client) => ({
  dashboard: () => client.get('/reports/dashboard'),
  inventorySummary: () => client.get('/reports/inventory-summary'),
  driverBalances: () => client.get('/reports/driver-balances'),
  paymentSummary: () => client.get('/reports/payment-summary'),
  purchaseSummary: () => client.get('/reports/purchase-summary')
});
