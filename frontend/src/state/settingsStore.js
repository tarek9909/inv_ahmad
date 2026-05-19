import { api } from '../api/index.js';
import { createStore } from './createStore.js';

export const createSettingsStore = ({ settingsApi = api.settings } = {}) => {
  const store = createStore({ settings: {}, loading: false, saving: false, error: null });
  return {
    ...store,
    async load() {
      store.setState({ loading: true, error: null });
      try {
        const result = await settingsApi.list();
        store.setState({ settings: result.data || {}, loading: false });
        return result;
      } catch (error) {
        store.setState({ loading: false, error });
        throw error;
      }
    },
    async update(payload) {
      store.setState({ saving: true, error: null });
      try {
        const result = await settingsApi.update(payload);
        store.setState({ settings: result.data || {}, saving: false });
        return result;
      } catch (error) {
        store.setState({ saving: false, error });
        throw error;
      }
    }
  };
};

export const settingsStore = createSettingsStore();
