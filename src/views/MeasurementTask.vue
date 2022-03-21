<template>
  <div>
    <div class="d-print-none">
      <p>Всё готово к измерениям.</p>
      <p>Распечатайте этот лист средствами браузера, например клавишами
        <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>P</kbd> (или <kbd>⌘</kbd>&nbsp;+&nbsp;<kbd>P</kbd> на Mac).
      </p>
      <p>
        При распечатке вся ненужная информация будет сокрыта,
        поэтому распечатка лучше, чем скриншот.
      </p>
      <p>
        При распечатке подберите масштаб и поля так,
        чтобы всё поместилось на один лист, но при этом заполнило его.
      </p>
      <p>
        Распечатанный лист будет черновиком. По возвращении Вы всё из него перепишите в программу.
      </p>
      <p>
        Если на объекте испытаний у Вас есть
        компьютер (планшет, телефон) с доступом к этому приложению,
        то пропустите этот шаг и заполняйте таблицу на следующем шаге без бумаги.
      </p>
    </div>
    <hr class="d-print-none">
    <h6 class="text-center fw-bold">Задание на измерения</h6>
    <div class="d-flex flex-row">
      <div>Изделие&nbsp;</div>
      <div v-if="name">{{name}}</div>
      <HandField v-else class="flex-fill"/>
    </div>
    <div class="d-flex flex-row flex-nowrap">
      <HandField v-if="!name" class="flex-fill"/>
      <div v-if="!name">&nbsp;</div>
      <div>Зав.&nbsp;№&nbsp;</div>
      <div v-if="serial">{{serial}}</div>
      <HandField v-if="!serial" width="9em"/>
    </div>
    <div>
      Внутренний диаметр измерительного трубопровода D =
      <NumberOutput :value="Dmm" tofixed="1"/>мм
    </div>
    <div>
      Диаметр отверстия диафрагмы d =
      <NumberOutput :value="dMM" tofixed="1"/>мм
    </div>
    <p>
      Регулируя заслонку, произвести измерения в пяти режимах.
      В рамках одного режима положение заслонки не менять.
    </p>
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
        <template v-for="parameter in [
                'Температура воздуха на входе в диафрагму t<sub>1</sub>, °С',
                'Температура воздуха в полости ИЭО t<sub>2</sub>, °С',
                'Избыточное давление воздуха на входе в диафрагму ∆p<sub>1</sub>, Па',
                'Разность статических давлений воздуха по обе стороны диафрагмы ∆p<sub>2</sub>, Па',
                'Избыточное давление воздуха в полости ИЭО ∆p<sub>3</sub>, Па',
                ]"
                  :key="parameter"
        >
          <tr v-for="(entry,index) in volumes" :key="entry[0]">
            <td :rowspan="volumes.size"
                v-if="index===0" class="text-start" v-html="parameter"
            >
            </td>
            <td>{{entry[1].name}}</td>
            <td v-for="(meas,i) in entry[1].measurements" :key="i"></td>
          </tr>
        </template>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Атмосферное давление p<sub>б</sub>, мм рт.ст.
          </td>
          <td>{{entry[1].name}}</td>
          <td :colspan="MEASUREMENTS_NUMBER"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  mapGetters, mapState,
} from 'vuex';

import HandField from '../components/HandField.vue';
import NumberOutput from '../components/NumberOutput.vue';

export default {
  components: {
    HandField,
    NumberOutput,
  },
  emits: ['stepFilledIncorrectly'],
  watch: {
    stepFilledIncorrectly(newValue) {
      this.$emit('stepFilledIncorrectly', newValue);
    },
  },
  computed: {
    ...mapGetters('volumes', [
      'MEASUREMENTS_NUMBER',
    ]),
    ...mapGetters('equipment', [
      'dMM', 'Dmm',
    ]),
    ...mapState('nominals', [
      'name', 'serial',
    ]),
    ...mapState({ volumes: (state) => state.volumes }),
    stepFilledIncorrectly() {
      return (
        false
      );
    },
  },
  methods: {},
  mounted() {
    this.$emit('stepFilledIncorrectly', this.stepFilledIncorrectly);
  },
};

</script>

<style scoped lang="scss">
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
