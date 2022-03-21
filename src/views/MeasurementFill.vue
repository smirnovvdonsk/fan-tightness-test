<template>
  <div>
    <div class="form-floating my-2">
      <textarea class="form-control" id="deviceName" v-model="name"></textarea>
      <label for="deviceName">Название изделия (как оно будет в протоколе):</label>
    </div>

    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
    >
      <div class="d-flex flex-column flex-md-row
                  justify-content-between align-items-stretch align-items-md-center
                  me-lg-3 my-1">
        <label for="deviceSerial" class="me-2">Заводской&nbsp;номер:</label>
        <input type="text" class="form-control" id="deviceSerial" v-model="serial">
      </div>
      <div class="d-flex flex-column flex-md-row
                  flex-fill
                  justify-content-between align-items-stretch align-items-md-center
                  my-1">
        <label for="devicePlace" class="me-2">
          Место&nbsp;проведения&nbsp;испытаний:
        </label>
        <input type="text" class="form-control flex-fill" id="devicePlace" v-model="place">
      </div>
    </div>
    <div>
      Внутренний диаметр измерительного трубопровода D =
      <NumberOutput :value="Dmm" tofixed="1"/>мм
    </div>
    <div>
      Диаметр отверстия диафрагмы d =
      <NumberOutput :value="dMM" tofixed="1"/>мм
    </div>
    <h5>Выполненные измерения:</h5>
    <table class="printed-table">
      <thead>
        <tr>
          <th rowspan="2">Параметр</th>
          <th rowspan="2">ИЭО</th>
          <th :colspan="MEASUREMENTS_NUMBER">
            Результаты замеров и расчетов
          </th>
        </tr>
        <tr>
          <th
            v-for="index in MEASUREMENTS_NUMBER"
            :key="index"
          >
            {{index}}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Диаметр отверстия диафрагмы d, мм
          </td>
          <td>{{entry[1].name}}</td>
          <td :rowspan="volumes.size" v-if="index===0"
              :colspan="MEASUREMENTS_NUMBER">
            <NumberOutput :value="dMM" tofixed="1"/>
          </td>
        </tr>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Внутренний диаметр измерительного трубопровода D, мм
          </td>
          <td>{{entry[1].name}}</td>
          <td :rowspan="volumes.size" v-if="index===0"
              :colspan="MEASUREMENTS_NUMBER">
            <NumberOutput :value="Dmm" tofixed="1"/>
          </td>
        </tr> -->
        <template v-for="(parameter,parIndex) in parametersToFill"
              :key="parameter"
        >
          <tr v-for="(entry,index) in volumes" :key="entry[0]">
            <td :rowspan="volumes.size"
                v-if="index===0" class="text-start" v-html="parameter.title"
            >
            </td>
            <td>{{entry[1].name}}</td>
            <td v-for="(meas,i) in entry[1].measurements" :key="i">
              <NumberInput
                tofixed="1"
                :modelValue="meas[parameter.name]"
                @update:modelValue="(val)=>$store.commit(
                  `volumes/${parameter.name}ByIdAndIndex`,
                  {id:entry[0], index:i, value:val}
                )"
                @keydown="fillRow(parIndex, entry[0], i, $event)"
                @keyup="onKeyUp"
                @keydown.right.prevent="moveRightLeft(parIndex, entry[0], i, 'right')"
                @keydown.left.prevent="moveRightLeft(parIndex, entry[0], i, 'left')"
                @keydown.up.prevent="moveUpDown(parIndex, entry[0], i, 'up')"
                @keydown.down.prevent="moveUpDown(parIndex, entry[0], i, 'down')"
                :ref="`${parIndex}:${entry[0]}`"
                :invalid="incorrectMeasurementsById(entry[0])[i][parameter.name]"
              />
            </td>
          </tr>
        </template>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Атмосферное давление p<sub>б</sub>, мм рт.ст.
          </td>
          <td>{{entry[1].name}}</td>
          <td :colspan="MEASUREMENTS_NUMBER">
            <NumberInput
              tofixed="1"
              :modelValue="entry[1].barometer"
              @update:modelValue="(val)=>$store.commit(
                'volumes/barometerById',
                {id:entry[0], value:val}
              )"
              :invalid="incorrectBarometerById(entry[0])"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  mapGetters, mapState,
} from 'vuex';

import NumberInput from '../components/NumberInput.vue';
import NumberOutput from '../components/NumberOutput.vue';

export default {
  data() {
    return {
      keysPressed: new Set(),
    };
  },
  components: {
    NumberInput,
    NumberOutput,
  },
  emits: ['stepFilledIncorrectly'],
  watch: {
    stepFilledIncorrectly(newValue) {
      this.$emit('stepFilledIncorrectly', newValue);
    },
  },
  computed: {
    parametersToFill() {
      return [
        { name: 't1', title: 'Температура воздуха на входе в диафрагму t<sub>1</sub>, °С' },
        { name: 't2', title: 'Температура воздуха в полости ИЭО t<sub>2</sub>, °С' },
        { name: 'deltaP1', title: 'Избыточное давление воздуха на входе в диафрагму ∆p<sub>1</sub>, Па' },
        { name: 'deltaP2', title: 'Разность статических давлений воздуха по обе стороны диафрагмы ∆p<sub>2</sub>, Па' },
        { name: 'deltaP3', title: 'Избыточное давление воздуха в полости ИЭО ∆p<sub>3</sub>, Па' },
      ];
    },
    ...mapGetters('volumes', [
      'MEASUREMENTS_NUMBER',
      'incorrectBarometerById', 'incorrectBarometer',
      'incorrectMeasurementsById', 'incorrectMeasurements',
    ]),
    ...mapGetters('equipment', [
      'dMM', 'Dmm',
    ]),
    ...mapState({ volumes: (state) => state.volumes }),
    stepFilledIncorrectly() {
      return (
        this.incorrectBarometer
        || this.incorrectMeasurements
      );
    },
    name: {
      get() { return this.$store.state.nominals.name; },
      set(value) { this.$store.commit('nominals/name', value); },
    },
    serial: {
      get() { return this.$store.state.nominals.serial; },
      set(value) { this.$store.commit('nominals/serial', value); },
    },
    place: {
      get() { return this.$store.state.nominals.place; },
      set(value) { this.$store.commit('nominals/place', value); },
    },
  },
  methods: {
    onBlur() {
      this.keysPressed.clear();
    },
    fillRow(parIndex, volId, measIndex, event) {
      this.keysPressed.add(event.code);
      const KEYS_TO_FILL = ['ControlLeft', 'ShiftLeft', 'KeyF'];
      if (
        KEYS_TO_FILL.every((code) => this.keysPressed.has(code))
      ) {
        const measurementsArray = this.volumes.get(volId).measurements;
        const parameterName = this.parametersToFill[parIndex].name;
        const newValue = measurementsArray[measIndex][parameterName];
        measurementsArray.forEach((meas, index) => this.$store.commit(
          `volumes/${parameterName}ByIdAndIndex`,
          { id: volId, index, value: newValue },
        ));
      }
    },
    onKeyUp(event) {
      this.keysPressed.delete(event.code);
    },
    moveRightLeft(parIndex, volId, measIndex, action) {
      const colRef = `${parIndex}:${volId}`;
      const ROW = this.$refs[colRef];
      let newIndex;
      if (action === 'left') {
        newIndex = measIndex - 1;
      }
      if (action === 'right') {
        newIndex = measIndex + 1;
      }
      const weCan = (newIndex + 1 <= ROW.length && newIndex >= 0 && newIndex !== undefined);
      if (weCan) {
        const elem = ROW[newIndex].$el;
        elem.focus();
        elem.select();
      }
    },
    moveUpDown(parIndex, volId, measIndex, action) {
      const isFirstParameter = parIndex <= 0;
      const isLastParameter = parIndex >= (this.parametersToFill.length - 1);
      const prevParIndex = isFirstParameter ? parIndex : parIndex - 1;
      const nextParIndex = isLastParameter ? parIndex : parIndex + 1;
      const volumeIndex = [...this.volumes].findIndex((vol) => vol[0] === volId);
      const theFirstVolId = [...this.volumes][0][0];
      const theLastVolId = [...this.volumes][[...this.volumes].length - 1][0];
      const isFirstVolume = volumeIndex <= 0;
      const isLastVolume = volumeIndex >= ([...this.volumes].length - 1);
      const prevVolId = isFirstVolume ? volId : [...this.volumes][volumeIndex - 1][0];
      const nextVolId = isLastVolume ? volId : [...this.volumes][volumeIndex + 1][0];
      let newParIndex = parIndex;
      let newVolId = volId;
      if (action === 'up') {
        if (!isFirstVolume) {
          newVolId = prevVolId;
        } else if (!isFirstParameter) {
          newParIndex = prevParIndex;
          newVolId = theLastVolId;
        }
      }
      if (action === 'down') {
        if (!isLastVolume) {
          newVolId = nextVolId;
        } else if (!isLastParameter) {
          newParIndex = nextParIndex;
          newVolId = theFirstVolId;
        }
      }
      const elem = this.$refs[`${newParIndex}:${newVolId}`][measIndex].$el;
      elem.focus();
      elem.select();
    },
  },
  mounted() {
    this.$emit('stepFilledIncorrectly', this.stepFilledIncorrectly);
  },
};

</script>

<style scoped lang="scss">
.d-flex > div {
  margin: 0.2em;
}

.printed-table {
  text-align: center;
  td {
    input {
      // border: none;
      text-align: center;
    }
  }
}
</style>
