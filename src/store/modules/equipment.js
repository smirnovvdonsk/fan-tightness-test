const EQUIPMENT = {
  namespaced: true,
  state: () => ({
    d: 0, // м. Диаметр отверстия диафрагмы
    D: 0, // м. Внутренний диаметр измерительного трубопровода
  }),
  mutations: {
    import(state, payload) { Object.assign(state, payload); },

    d(state, payload) { state.d = payload; },
    dMM(state, payload) { state.d = payload / 1000; },

    D(state, payload) { state.D = payload; },
    Dmm(state, payload) { state.D = payload / 1000; },

  },
  actions: {},
  getters: {
    export: (state) => ({ ...state }),

    dMM: ({ d }) => d * 1000,
    incorrectd: ({ d }) => d <= 0,

    Dmm: ({ D }) => D * 1000,
    incorrectD: ({ D }) => D <= 0,

    beta: ({ D, d }) => d / D,
    E: (state, { beta }) => 1 / Math.sqrt(1 - beta ** 4),

  },
  modules: {},
};

export default EQUIPMENT;
