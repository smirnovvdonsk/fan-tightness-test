import { createStore } from 'vuex';
import { stepRoutes } from '../router/router';
import volumes from './modules/volumes';
import nominals from './modules/nominals';
import equipment from './modules/equipment';

const MODULES = ['volumes', 'nominals', 'equipment'];

const STEP_PATHS = stepRoutes.map((route) => route.path);
const STEP_NAMES = stepRoutes.map((route) => route.name);

export default createStore({
  state: {
    currentStepIndex: 0,
    d: 16 / 1000, // м. Диаметр отверстия диафрагмы
  },
  modules: {
    volumes,
    nominals,
    equipment,
  },
  mutations: {
    NEXT_STEP(state) { state.currentStepIndex += 1; },
    PREVIOUS_STEP(state) { state.currentStepIndex -= 1; },
    currentStepIndex(state, payload) { state.currentStepIndex = payload; },
  },
  actions: {
    setNextStep({ commit, getters }) { if (!getters.isTheLastStep) commit('NEXT_STEP'); },
    setPreviousStep({ commit, getters }) { if (!getters.isTheFirstStep) commit('PREVIOUS_STEP'); },
    import({ commit }, payload) {
      commit('currentStepIndex', payload.currentStepIndex);
      MODULES.forEach((module) => commit(`${module}/import`, payload[module]));
    },
  },
  getters: {
    isTheFirstStep: (state) => (state.currentStepIndex <= 0),
    isTheLastStep: (state) => (state.currentStepIndex >= (STEP_PATHS.length - 1)),
    currentStepPath: (state) => STEP_PATHS[state.currentStepIndex],
    currentStepName: (state) => STEP_NAMES[state.currentStepIndex],
    export: ({ currentStepIndex }, getters, rootState, rootGetters) => ({
      currentStepIndex,
      ...Object.fromEntries(MODULES.map((key) => [key, rootGetters[`${key}/export`]])),
    }),
  },
});
