import { createStore } from './createStore.js';

export const createResourceStore = ({ api, initialFilters = { page: 1, limit: 20, search: '' } }) => {
  const store = createStore({
    rows: [],
    current: null,
    meta: {},
    filters: initialFilters,
    loading: false,
    saving: false,
    error: null,
    lastMessage: ''
  });

  const run = async (flag, action) => {
    store.setState({ [flag]: true, error: null, lastMessage: '' });
    try {
      const result = await action();
      store.setState({ [flag]: false, lastMessage: result.message || '' });
      return result;
    } catch (error) {
      store.setState({ [flag]: false, error });
      throw error;
    }
  };

  const load = async (filters = {}) => run('loading', async () => {
    const nextFilters = { ...store.getState().filters, ...filters };
    const result = await api.list(nextFilters);
    store.setState({
      rows: Array.isArray(result.data) ? result.data : [],
      meta: result.meta || {},
      filters: nextFilters
    });
    return result;
  });

  const create = async (payload) => run('saving', async () => {
    const result = await api.create(payload);
    store.setState((state) => ({ rows: [result.data, ...state.rows].filter(Boolean) }));
    return result;
  });

  const update = async (id, payload) => run('saving', async () => {
    const result = await api.update(id, payload);
    store.setState((state) => ({
      rows: state.rows.map((row) => (row?.id === result.data?.id ? result.data : row)),
      current: state.current?.id === result.data?.id ? result.data : state.current
    }));
    return result;
  });

  const remove = async (id) => run('saving', async () => {
    const result = await api.delete(id);
    store.setState((state) => ({
      rows: state.rows.filter((row) => row?.id !== id),
      current: state.current?.id === id ? null : state.current
    }));
    return result;
  });

  return {
    ...store,
    load,
    create,
    update,
    delete: api.delete ? remove : undefined,
    setCurrent: (current) => store.setState({ current }),
    setFilters: (filters) => store.setState((state) => ({ filters: { ...state.filters, ...filters } })),
    clearError: () => store.setState({ error: null })
  };
};

export const createReadOnlyResourceStore = ({ api, initialFilters }) => {
  const { create, update, delete: remove, ...store } = createResourceStore({ api, initialFilters });
  return store;
};
