<template>
  <div>
    <div class="d-print-none">
      <p>Готов протокол испытаний.</p>
      <p>Распечатайте этот протокол средствами браузера, например клавишами
        <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>P</kbd> (или <kbd>⌘</kbd>&nbsp;+&nbsp;<kbd>P</kbd> на Mac).
      </p>
      <p>
        При распечатке вся ненужная информация будет сокрыта.
      </p>
      <p>
        При распечатке подберите масштаб и поля.
      </p>
      <p>
        Распечатанный протокол можно подписать и использовать как официальный документ.
      </p>
    </div>
    <hr class="d-print-none">
    <h6 class="text-center fw-bold">ПРОТОКОЛ</h6>
    <h6 class="text-center fw-bold">проверки герметичности конструкции по воздуху</h6>
    <h6 class="text-center fw-bold">№<HandField width="20em"/></h6>
    <div class="d-flex flex-row">
      <div>Испытанное изделие&nbsp;</div>
      <div v-if="name">{{name}}</div>
      <HandField v-if="!name" class="flex-fill"/>
    </div>
    <div class="d-flex flex-row flex-nowrap">
      <HandField v-if="!name" class="flex-fill"/>
      <div v-if="!name">&nbsp;</div>
      <div>Зав.&nbsp;№&nbsp;</div>
      <div v-if="serial">{{serial}}</div>
      <HandField v-if="!serial" width="9em"/>
    </div>
    <div class="d-flex flex-row">
      <div>Место&nbsp;проведения&nbsp;испытаний&nbsp;</div>
      <div v-if="place">{{place}}</div>
      <HandField v-if="!place" class="flex-fill"/>
    </div>
    <div class="d-flex flex-row">
      <div>Время&nbsp;проведения&nbsp;испытаний&nbsp;с</div>
      <HandField class="flex-fill"/>
      <div>по</div>
      <HandField class="flex-fill"/>
    </div>
    <table class="printed-table">
      <caption>Параметры изделия при эксплуатации:</caption>
      <thead>
        <tr>
          <th>Параметр</th>
          <th>Обозначение</th>
          <th>Единица измерения</th>
          <th>Значение</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-start">Производительность (требуемая или номинальная)</td>
          <td>Q<sub>ном</sub></td>
          <td>м<sup>3</sup>/ч</td>
          <td>
            <NumberOutput :value="Qnom" tofixed="0"/>
          </td>
        </tr>
        <tr>
          <td class="text-start">
            Избыточное давление воздуха (номинальное, максимальное или создаваемое)
          </td>
          <td>p<sub>ном</sub></td>
          <td>Па</td>
          <td>
            <NumberOutput :value="$store.state.nominals.Pnom" tofixed="1"/>
          </td>
        </tr>
        <tr>
          <td class="text-start">
            Номинальное атмосферное давление на месте эксплуатации изделия
          </td>
          <td>p<sub>атм</sub></td>
          <td>Па</td>
          <td>
            <NumberOutput :value="$store.state.nominals.Patm" tofixed="0"/>
          </td>
        </tr>
        <tr>
          <td class="text-start">
            Максимальная температура окружающей среды при эксплуатации
          </td>
          <td>t<sub>окр</sub></td>
          <td>°С</td>
          <td>
            <NumberOutput :value="$store.state.nominals.tEnv" tofixed="1"/>
          </td>
        </tr>
        <tr>
          <td class="text-start">
            Степень негерметичности изделия (требуемая или номинальная)
          </td>
          <td>φ</td>
          <td>%</td>
          <td>
            <NumberOutput :value="phi" tofixed="2"/>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="printed-table">
      <caption>Параметры ИЭО при эксплуатации:</caption>
      <thead>
        <tr>
          <th>Параметр</th>
          <th>ИЭО</th>
          <th>Значение</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Нахождение под избыточным давлением («+») или под вакуумом («–»)
          </td>
          <td>{{entry[1].name}}</td>
          <td>
            <span v-if="!$store.getters['volumes/vacuumById'](entry[0])">+</span>
            <span v-else>–</span>
          </td>
        </tr>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Номинальная температура воздуха внутри ИЭО, t<sub>ном</sub>, °С
          </td>
          <td>{{entry[1].name}}</td>
          <td>
            <NumberOutput
                v-if="!$store.getters['volumes/vacuumById'](entry[0])"
                :value="$store.getters['volumes/TnomById'](entry[0])"
                tofixed="1"
            />
            <span v-else>не важно</span>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="printed-table">
      <caption>Результаты:</caption>
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
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
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
        </tr>
        <template v-for="parameter in parameters1"
              :key="parameter"
        >
          <tr v-for="(entry,index) in volumes" :key="entry[0]">
            <td :rowspan="volumes.size"
                v-if="index===0" class="text-start" v-html="parameter.title"
            >
            </td>
            <td>{{entry[1].name}}</td>
            <td v-for="(meas,i) in entry[1].measurements" :key="i">
              <NumberOutput
                :tofixed="parameter.tofixed"
                :value="meas[parameter.name]"
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
            <NumberOutput
              tofixed="1"
              :value="entry[1].barometer"
            />
          </td>
        </tr>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Атмосферное давление p<sub>0</sub>, Па
          </td>
          <td>{{entry[1].name}}</td>
          <td :colspan="MEASUREMENTS_NUMBER">
            <NumberOutput
              tofixed="0"
              :value="$store.getters['volumes/barometerPascalById'](entry[0])"
            />
          </td>
        </tr>
        <template v-for="parameter in parameters2"
              :key="parameter"
        >
          <tr v-for="(entry,index) in volumes" :key="entry[0]">
            <td :rowspan="volumes.size"
                v-if="index===0" class="text-start" v-html="parameter.title"
            >
            </td>
            <td>{{entry[1].name}}</td>
            <td v-for="(meas,i) in entry[1].measurements" :key="i">
              <NumberOutput
                :tofixed="parameter.tofixed"
                :value="$store.getters[`volumes/${parameter.name}ByIdAndIndex`](entry[0])(i)"
              />
            </td>
          </tr>
        </template>
        <tr v-for="(entry,index) in volumes" :key="entry[0]">
          <td :rowspan="volumes.size" v-if="index===0" class="text-start">
            Среднее арифметическое значение
            живого сечения неплотностей ИЭО (μΩ)<sub>ИЭО<sub>СР</sub></sub>, мм<sup>2</sup>
          </td>
          <td>{{entry[1].name}}</td>
          <td :colspan="MEASUREMENTS_NUMBER">
            <NumberOutput
              tofixed="2"
              :value="$store.getters['volumes/muOmegaMMById'](entry[0])"
            />
          </td>
        </tr>
        <tr>
          <td class="text-start">
            Степень негерметичности установки φ, %
          </td>
          <td>-</td>
          <td :colspan="MEASUREMENTS_NUMBER">
            <NumberOutput
              tofixed="3"
              :value="phiResult"
            />
          </td>
        </tr>
      </tbody>
    </table>

<!-- Заключение -->

    <h6 class="text-center fw-bold mt-2">ЗАКЛЮЧЕНИЕ</h6>
    <div>
      По результатам проверки герметичности конструкции по воздуху определено,
      что степень негерметичности <NumberOutput :value="phiResult" tofixed="3"/>%
      составляет <span v-if="success">не</span> более
      <NumberOutput :value="phi" tofixed="3"/>% (указанных в задании)
      от номинальной производительности <NumberOutput :value="Qnom" tofixed="0"/>м<sup>3</sup>/ч.
    </div>
    <div class="d-flex flex-row">
      <div>Испытанное изделие&nbsp;</div>
      <div v-if="name">{{name}}</div>
      <HandField v-if="!name" class="flex-fill"/>
    </div>
    <div class="d-flex flex-row flex-nowrap">
      <HandField v-if="!name" class="flex-fill"/>
      <div v-if="!name">&nbsp;</div>
      <div>зав.&nbsp;№&nbsp;</div>
      <div v-if="serial">{{serial}}</div>
      <HandField v-if="!serial" width="9em"/>
    </div>
    <div>
      <span v-if="!success">не</span> соответствует требованиям задания
      <span v-if="success">и годно для использования по назначению (эксплуатации)</span>.
    </div>
    <div v-if="success" class="d-flex flex-row flex-nowrap">
      <HandField class="flex-fill mx-3">(Ф. И. О., должность)</HandField>
      <HandField width="20em" class="mx-3">Подпись</HandField>
      «<HandField width="4em">&nbsp;</HandField>»
      <HandField width="15em">&nbsp;</HandField>
      20
      <HandField width="4em">&nbsp;</HandField>
      г.
    </div>
    <div v-else>
      Изделие требует исправления и/или повторного испытания.
    </div>

  </div>
</template>

<script>
import {
  mapState, mapGetters,
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
    success() { return this.phiResult <= this.phi; },
    parameters1() {
      return [
        { name: 't1', tofixed: 1, title: 'Температура воздуха на входе в диафрагму t<sub>1</sub>, °С' },
        { name: 't2', tofixed: 1, title: 'Температура воздуха в полости ИЭО t<sub>2</sub>, °С' },
        { name: 'deltaP1', tofixed: 0, title: 'Избыточное давление воздуха на входе в диафрагму ∆p<sub>1</sub>, Па' },
        { name: 'deltaP2', tofixed: 0, title: 'Разность статических давлений воздуха по обе стороны диафрагмы ∆p<sub>2</sub>, Па' },
        { name: 'deltaP3', tofixed: 0, title: 'Избыточное давление воздуха в полости ИЭО ∆p<sub>3</sub>, Па' },
      ];
    },
    parameters2() {
      return [
        { name: 'dens1', tofixed: 4, title: 'Плотность среды на входе в диафрагму ρ<sub>1</sub>, кг/м<sup>3</sup>' },
        { name: 'qmGram', tofixed: 3, title: 'Массовый расход воздуха q<sub>m</sub>, г/с' },
        { name: 'densVol', tofixed: 4, title: 'Плотность среды в полости ИЭО ρ<sub>ИЭО</sub>, кг/м<sup>3</sup>' },
        { name: 'muOmegaMM', tofixed: 2, title: 'Живое сечение неплотностей ИЭО (μΩ)<sub>ИЭО</sub>, мм<sup>2</sup>' },
      ];
    },
    ...mapGetters('volumes', [
      'MEASUREMENTS_NUMBER', 'phiResult',
    ]),
    ...mapGetters('equipment', [
      'dMM', 'Dmm',
    ]),
    ...mapState('nominals', [
      'name', 'serial', 'place', 'phi', 'Qnom',
    ]),
    ...mapState({ volumes: (state) => state.volumes }),
    stepFilledIncorrectly() {
      return (
        false
      );
    },
  },
  methods: {
  },
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
