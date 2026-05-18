import { api } from '../api/index.js';
import { createStore } from './createStore.js';

export const createReportStore = ({ reportsApi = api.reports } = {}) => {
  const store = createStore({
    dashboard: null,
    inventorySummary: null,
    driverBalances: null,
    paymentSummary: null,
    purchaseSummary: null,
    loading: false,
    error: null
  });

  const load = async (key, request) => {
    store.setState({ loading: true, error: null });
    try {
      const result = await request();
      store.setState({ [key]: result.data, loading: false });
      return result;
    } catch (error) {
      store.setState({ loading: false, error });
      throw error;
    }
  };

  return {
    ...store,
    loadDashboard: () => load('dashboard', reportsApi.dashboard),
    loadInventorySummary: () => load('inventorySummary', reportsApi.inventorySummary),
    loadDriverBalances: () => load('driverBalances', reportsApi.driverBalances),
    loadPaymentSummary: () => load('paymentSummary', reportsApi.paymentSummary),
    loadPurchaseSummary: () => load('purchaseSummary', reportsApi.purchaseSummary)
  };
};

export const reportStore = createReportStore();
