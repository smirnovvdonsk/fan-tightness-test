import { v4 as uuidv4 } from 'uuid';

const MEASUREMENTS_NUMBER = 5;
const K = 1.4;
const ATM = 101325;
const ABS_NULL = -273.15;
const R = 287;
const Ra = 0.000025;

function Measurement() {
  this.t1 = -274;
  this.t2 = -274;
  this.deltaP1 = 0;
  this.deltaP2 = 0;
  this.deltaP3 = 0;
}

function Volume(name = '') {
  this.name = name;
  this.vacuum = true;
  this.Tnom = -274;
  this.barometer = 0; // мм.рт.ст. Pб - Показания барометра
  this.measurements = Array(MEASUREMENTS_NUMBER).fill(true).map(() => new Measurement());
}

const VOLUMES = {
  namespaced: true,
  state: () => (new Map()).set(uuidv4(), new Volume('ИЭО1')),
  mutations: {
    addEmpty(state) {
      function newName() {
        const PREFIX = 'ИЭО';
        const getName = (index) => `${PREFIX}${index}`;
        let resultIndex = PREFIX;
        for (let i = 1; i < 99; i += 1) {
          if ([...state.values()].every((volume) => volume.name !== getName(i))) {
            resultIndex = i;
            break;
          }
        }
        return getName(resultIndex);
      }
      for (;;) {
        const id = uuidv4();
        if (!state.has(id)) {
          state.set(id, new Volume(newName()));
          break;
        }
      }
    },
    removeById(state, id) { state.delete(id); },
    import(state, payload) {
      try {
        const entries = Object.entries(payload);
        if (entries.length) {
          state.clear();
          entries.forEach((entry) => state.set(...entry));
        }
      } catch {
        // Пусто
      }
    },

    barometerById(state, { id, value }) { state.get(id).barometer = value; },
    barometerPascalById(state, { id, value }) { state.get(id).barometer = (value * 760) / ATM; },

    nameById(state, { id, value }) { state.get(id).name = value; },

    vacuumById(state, { id, value }) { state.get(id).vacuum = Boolean(value); },

    TnomById(state, { id, value }) { state.get(id).Tnom = value; },

    t1ByIdAndIndex(state, { id, index, value }) { state.get(id).measurements[index].t1 = value; },
    t2ByIdAndIndex(state, { id, index, value }) { state.get(id).measurements[index].t2 = value; },
    deltaP1ByIdAndIndex(state, { id, index, value }) {
      state.get(id).measurements[index].deltaP1 = value;
    },
    deltaP2ByIdAndIndex(state, { id, index, value }) {
      state.get(id).measurements[index].deltaP2 = value;
    },
    deltaP3ByIdAndIndex(state, { id, index, value }) {
      state.get(id).measurements[index].deltaP3 = value;
    },
  },
  actions: {},
  getters: {
    export: (state) => Object.fromEntries(state),

    noVolumes: (state) => state.size < 1,

    barometerById: (state) => (id) => state.get(id).barometer,
    barometerPascalById: (state) => (id) => ATM * (state.get(id).barometer / 760),
    incorrectBarometerById: (state) => (id) => state.get(id).barometer <= 0,
    incorrectBarometer: (state, { incorrectBarometerById }) => (
      [...state.keys()].some(incorrectBarometerById)
    ),

    vacuumById: (state) => (id) => Boolean(state.get(id).vacuum),

    TnomById: (state) => (id) => state.get(id).Tnom,
    TsNomById: (state) => (id) => state.get(id).Tnom - ABS_NULL,
    incorrectTnomById: (state) => (id) => state.get(id).Tnom <= ABS_NULL,
    incorrectTnom: (state, { incorrectTnomById }) => (
      [...state.keys()].some((id) => !state.get(id).vacuum && incorrectTnomById(id))
    ),

    nameById: (state) => (id) => state.get(id).name,
    incorrectNameById: (state) => (id) => state.get(id).name.length <= 0,
    incorrectName: (state, { incorrectNameById }) => [...state.keys()].some(incorrectNameById),
    nonUniqueNames: (state) => {
      const names = [...state.values()].map(({ name }) => name);
      const namesWithoutDuplicates = [...new Set(names)];
      return names.length !== namesWithoutDuplicates.length;
    },

    incorrectMeasurementsByIdAndIndex: (state) => (id) => (index) => {
      const {
        t1, t2, deltaP1, deltaP2, deltaP3,
      } = state.get(id).measurements[index];
      return {
        t1: t1 <= ABS_NULL,
        t2: t2 <= ABS_NULL,
        deltaP1: deltaP1 <= 0,
        deltaP2: deltaP2 <= 0,
        deltaP3: deltaP3 <= 0,
      };
    },

    incorrectMeasurementsById: (state, { incorrectMeasurementsByIdAndIndex }) => (id) => (
      state.get(id).measurements
        .map((meas, index) => incorrectMeasurementsByIdAndIndex(id)(index))
    ),

    incorrectMeasurements: (state, { incorrectMeasurementsById }) => (
      [...state.keys()]
        .map(incorrectMeasurementsById)
        .flat()
        .map(Object.values)
        .flat()
        .some((value) => value)
    ),

    measurementsStatusById: (state, { incorrectMeasurementsByIdAndIndex }) => (id) => {
      const { measurements } = state.get(id);
      const total = measurements.length;
      const complete = measurements
        .map((meas, index) => incorrectMeasurementsByIdAndIndex(id)(index))
        .map(Object.values)
        .filter((arr) => arr.every((x) => !x))
        .length;
      return { complete, total };
    },

    MEASUREMENTS_NUMBER(state) {
      const volumes = [...state.values()];
      const lengths = volumes.map((vol) => vol.measurements.length);
      return Math.max(...lengths);
    },

    /* Results */
    p1ByIdAndIndex: (state, getters) => (id) => (index) => {
      const { deltaP1 } = state.get(id).measurements[index];
      const p0 = getters.barometerPascalById(id);
      return p0 + Math.abs(deltaP1);
    },
    epsilonByIdAndIndex: (state, getters, rootState, rootGetters) => (id) => (index) => {
      const beta = rootGetters['equipment/beta'];
      const { deltaP2 } = state.get(id).measurements[index];
      const p1 = getters.p1ByIdAndIndex(id)(index);
      const factor1 = (0.351 + 0.256 * beta ** 4 + 0.93 * beta ** 8);
      const factor2 = 1 - (1 - Math.abs(deltaP2) / p1) ** (1 / K);
      return 1 - factor1 * factor2;
    },
    mu1ByIdAndIndex: (state, getters) => (id) => (index) => {
      const p1 = getters.p1ByIdAndIndex(id)(index);
      const { t1 } = state.get(id).measurements[index];
      const term1 = 1.82e-5;
      const term2 = 1.524e-13 * (p1 - ATM);
      const term3 = 4.765e-8 * (t1 - 20);
      return term1 + term2 + term3;
    },
    ts1ByIdAndIndex: (state) => (id) => (index) => {
      const { t1 } = state.get(id).measurements[index];
      return t1 - ABS_NULL;
    },
    ts2ByIdAndIndex: (state) => (id) => (index) => {
      const { t2 } = state.get(id).measurements[index];
      return t2 - ABS_NULL;
    },
    tsEnv: (state, getters, rootState) => rootState.nominals.tEnv - ABS_NULL,
    dens1ByIdAndIndex: (state, getters) => (id) => (index) => {
      const { deltaP1 } = state.get(id).measurements[index];
      const p0 = getters.barometerPascalById(id);
      const ts1 = getters.ts1ByIdAndIndex(id)(index);
      return (p0 + Math.abs(deltaP1)) / (R * ts1);
    },
    qmByIdAndIndex: (state, getters, rootState, rootGetters) => (id) => (index) => {
      const { D, d } = rootState.equipment;
      const dens1 = getters.dens1ByIdAndIndex(id)(index);
      const mu1 = getters.mu1ByIdAndIndex(id)(index);
      const epsilon = getters.epsilonByIdAndIndex(id)(index);
      const { deltaP2 } = state.get(id).measurements[index];
      const beta = rootGetters['equipment/beta'];
      const E = rootGetters['equipment/E'];
      let qmPol;
      let qmPr = (1e6 * mu1 * Math.PI * D) / 4;
      let deltaQM = Infinity;
      const MAX_DELTA_QM = 0.1;
      let iteration = 0;
      const MAX_ITERATIONS = 1024;
      while (deltaQM > MAX_DELTA_QM) {
        iteration += 1;
        if (iteration >= MAX_ITERATIONS) {
          console.warn('Слишком много итераций для вычисления расхода qm.');
          break;
        }
        const w = qmPr / ((Math.PI / 4) * D ** 2 * dens1);
        const Re = (w * D * dens1) / mu1;
        const a = ((19000 * beta) / Re) ** 0.8;
        const L1 = 1;
        const L2 = 0.47;
        const M1 = (2 * L2) / (1 - beta);
        let M2;
        if (D < 0.07112) {
          M2 = 0.011 * (0.75 - beta) * (2.8 - (D / 0.0254));
        } else {
          M2 = 0;
        }
        const C = 0.5961 + 0.0261 * beta ** 2 - 0.216 * beta ** 8
                + 0.000521 * ((1e6 * beta) / Re) ** 0.7
                + (0.0188 + 0.0063 * a) * beta ** 3.5 * (1e6 / Re) ** 0.3
                + (0.043 + 0.08 * Math.exp(-10 * L1) - 0.123 * Math.exp(-7 * L1))
                * (1 - 0.11 * a) * (beta ** 4 / (1 - beta ** 4))
                - 0.031 * (M1 - 0.8 * M1 ** 1.1) * beta ** 1.3
                + M2;
        const RE_RANGES_FOR_B = [1e4, 1e5, 3e6, 1e8];
        let B;
        if (Re > RE_RANGES_FOR_B[0] && Re <= RE_RANGES_FOR_B[1]) {
          B = [
            [8.87, -3.7114, 0.41841, 0],
            [6.7307, -5.5844, 0.732485, 0],
            [-10.244, 5.7094, 0.76477, 0],
          ];
        }
        if (Re > RE_RANGES_FOR_B[1] && Re <= RE_RANGES_FOR_B[2]) {
          B = [
            [27.23, -11.458, 1.6117, -0.07567],
            [-25.928, 12.426, -2.09397, 0.106143],
            [1.7622, -3.8765, 1.05567, -0.076764],
          ];
        }
        if (Re > RE_RANGES_FOR_B[2] && Re <= RE_RANGES_FOR_B[3]) {
          B = [
            [16.5416, -6.60709, 0.88147, -0.039226],
            [322.594, -132.2, 17.795, -0.799765],
            [-92.029, 37.935, -5.1885, 0.23583],
          ];
        }
        if (Re > RE_RANGES_FOR_B[3] || Re <= RE_RANGES_FOR_B[0]) {
          B = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ];
        }
        const A = [0, 1, 2]
          .map((item, j) => (
            B[j]
              .map((Bi) => Bi * Math.log10(Re) ** K)
              .reduce((sum, el) => sum + el, 0)
          ));

        let rmax;
        if (Re <= 1e4) {
          rmax = (0.718866 * beta ** (-3.887) + 0.364);
        } else if (beta < 0.65) {
          rmax = A[0] * beta ** A[1] + A[2];
        } else {
          rmax = A[0] * 0.65 ** A[1] + A[2];
        }
        if (rmax >= 15) rmax = 15;
        const RaMax = rmax * 1e-4 * D;

        let rmin;
        if (beta < 0.65) {
          rmin = 7.1592 - 12.387 * beta - (2.0118 - 3.469 * beta) * Math.log10(Re)
                + (0.1382 - 0.23762 * beta) * Math.log10(Re) ** 2;
        } else {
          rmin = -0.892353 + 0.24308 * Math.log10(Re) - 0.0162562 * Math.log10(Re) ** 2;
        }
        if (rmin <= 0 || Re < 3e6) rmin = 0;
        const RaMin = rmin * 1e-4 * D;
        const getLambda = (Ash, kD, kR) => {
          const lgArg = ((2 * Ash) / D)
                        - (37.36 * Math.log10(kD - kR * Math.log10(kD + (10 / 3) * kR))) / (Re);
          return (1.74 - 2 * Math.log10(lgArg)) ** (-2);
        };
        const kR = 5.035 / Re;
        const lambda = getLambda(
          Math.PI * Ra, // Ash
          (0.26954 * Math.PI * Ra) / D, // kD
          kR, // kR
        );
        let AshConv;
        if (Ra > RaMax) {
          AshConv = Math.PI * RaMax;
        } if (Ra < RaMin) AshConv = Math.PI * RaMin;
        AshConv = Math.PI * Ra;
        const lambdaConv = getLambda(
          AshConv, // Ash*
          (0.26954 * AshConv) / D, // kD*
          kR, // kR*
        );
        let Ksh;
        if (Ra >= RaMin && Ra <= RaMax) {
          Ksh = 1;
        } else {
          Ksh = 1 + 5.22 * beta ** 3.5 * (lambda - lambdaConv);
        }
        const Kp = 1;
        qmPol = ((Math.PI * d ** 2) / 4)
                      * C * Ksh * Kp * E * epsilon * Math.sqrt(2 * dens1 * Math.abs(deltaP2));
        deltaQM = (Math.abs(qmPol - qmPr) / qmPol) * 100;
        qmPr = (qmPr + qmPol) / 2;
      }
      return qmPol;
    },
    qmGramByIdAndIndex: (state, getters) => (id) => (index) => (
      getters.qmByIdAndIndex(id)(index) * 1000
    ),
    densVolByIdAndIndex: (state, getters) => (id) => (index) => {
      const { deltaP3 } = state.get(id).measurements[index];
      const p0 = getters.barometerPascalById(id);
      const ts2 = getters.ts2ByIdAndIndex(id)(index);
      return (Math.abs(deltaP3) + p0) / (R * ts2);
    },
    muOmegaByIdAndIndex: (state, getters) => (id) => (index) => {
      const qm = getters.qmByIdAndIndex(id)(index);
      const { deltaP3 } = state.get(id).measurements[index];
      const densVol = getters.densVolByIdAndIndex(id)(index);
      return qm / Math.sqrt(2 * Math.abs(deltaP3) * densVol);
    },
    muOmegaMMByIdAndIndex: (state, getters) => (id) => (index) => (
      getters.muOmegaByIdAndIndex(id)(index) * 1000000
    ),
    muOmegaById: (state, getters) => (id) => {
      const muOmegaArray = Array(getters.MEASUREMENTS_NUMBER)
        .fill(true)
        .map((item, index) => getters.muOmegaByIdAndIndex(id)(index));
      return muOmegaArray
        .reduce((sum, el) => sum + el, 0)
        / getters.MEASUREMENTS_NUMBER;
    },
    muOmegaMMById: (state, getters) => (id) => (
      getters.muOmegaById(id) * 1000000
    ),
    densNomById: (state, getters, rootState) => (id) => {
      const { Patm, Pnom } = rootState.nominals;
      const { tsEnv } = getters;
      const TsNom = getters.TsNomById(id);
      const { vacuum } = state.get(id);
      return vacuum ? Patm / (R * tsEnv) : (Patm + Pnom) / (R * TsNom);
    },
    QLeakById: (state, getters, rootState) => (id) => {
      const muOmega = getters.muOmegaById(id);
      const densNom = getters.densNomById(id);
      const { Pnom } = rootState.nominals;
      return muOmega * Math.sqrt((2 * Math.abs(Pnom)) / densNom);
    },
    phiResult: (state, getters, rootState) => {
      const sumQLeak = [...state.keys()]
        .map(getters.QLeakById)
        .reduce((sum, el) => sum + el, 0);
      const { Qnom } = rootState.nominals;
      return 3600 * (sumQLeak / Qnom) * 100;
    },
  },
  modules: {},
};

export default VOLUMES;
