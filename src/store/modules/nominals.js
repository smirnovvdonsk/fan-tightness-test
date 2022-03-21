const NOMINALS = {
  namespaced: true,
  state: () => ({
    name: '',
    serial: '',
    place: '',
    Qnom: 0, // м3/ч. Номинальная производительность
    Patm: 101325, // Па. Номинальное атмосферное давление
    Pnom: 0, // Па. Номинальное давление
    tEnv: 20, // °C. Максимальная температура окружающей среды в месте расположения
    phi: 0, // %. Степень негерметичности номинальная
  }),
  mutations: {
    import(state, payload) { Object.assign(state, payload); },

    name(state, payload) { state.name = payload; },
    serial(state, payload) { state.serial = payload; },
    place(state, payload) { state.place = payload; },

    phi(state, payload) { state.phi = payload; },
    phiAbsolute(state, payload) { state.phi = payload * 100; },

    tEnv(state, payload) { state.tEnv = payload; },

    Pnom(state, payload) { state.Pnom = payload; },

    Patm(state, payload) { state.Patm = payload; },
    PatmMMHg(state, payload) { state.Patm = (payload / 760) * 101325; },

    Qnom(state, payload) { state.Qnom = payload; }, // м3/ч. Номинальная производительность
    QnomPerSecond(state, payload) { // м3/с. Номинальная производительность
      state.Qnom = payload * 3600;
    },
  },
  actions: {},
  getters: {
    export: (state) => ({ ...state }),

    phiAbsolute: ({ phi }) => phi * 100,
    incorrectPhi: ({ phi }) => phi <= 0,

    incorrectTenv: ({ tEnv }) => tEnv <= -273.15,

    PatmMMHg: ({ Patm }) => (Patm / 101325) * 760,
    incorrectPatm: ({ Patm }) => Patm <= 0,

    incorrectPnom: ({ Pnom }) => Pnom <= 0,

    QnomPerSecond: ({ Qnom }) => Qnom / 3600,
    incorrectQnom: ({ Qnom }) => Qnom <= 0,
  },
  modules: {},
};

export default NOMINALS;
