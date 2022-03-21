<template>
  <div>
    <p>Разделите испытуемое изделие на один или несколько элементов (ИЭО)</p>
    <p>Каждый ИЭО будет испытываться отдельно.</p>
    <p>Для удобства можно присвоить каждому ИЭО короткое осмысленное название.</p>
    <p>
      Для каждого ИЭО нужно определить, находится ли он в номинальном режиме под вакуумом
      или под избыточным давлением.
    </p>
    <div class="card">
      <div class="card-header">Список ИЭО</div>
      <div class="card-body volume-grid">
        <transition-group name="volume-list-animation">
          <div v-for="volume in $store.state.volumes" :key="volume[0]"
                class="card text-white bg-dark shadow
                        d-flex flex-column
                        p-2"
          >
            <div class="input-group my-1">
              <span class="input-group-text">Название:</span>
              <input type="text" class="form-control py-0"
                :value="volume[1].name"
                @input="$store.commit('volumes/nameById',
                        {id:volume[0], value:$event.target.value})"
                size="20"
              >
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <Check
                :modelValue="volume[1].vacuum"
                @update:modelValue="(val)=>$store.commit(
                  'volumes/vacuumById',
                  {id:volume[0], value:val}
                  )"
              >
                Вакуум
              </Check>
              <div class="input-group my-1 ms-2">
                <span class="input-group-text">t<sub>ном</sub></span>
                <NumberInput
                    :modelValue="volume[1].Tnom"
                    @update:modelValue="(val)=>$store.commit(
                    'volumes/TnomById',
                      {id:volume[0], value:val}
                      )"
                    tofixed="1"
                    size="3"
                    :dashed="volume[1].vacuum"
                    :invalid="!volume[1].vacuum
                              && $store.getters['volumes/incorrectTnomById'](volume[0])"
                />
                <span class="input-group-text">°C</span>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="badge bg-danger"
                    v-if="measurementsStatusById(volume[0]).complete===0"
              >
                Измерения ещё не проводились
              </div>
              <div class="badge bg-warning text-dark"
                  v-else-if="measurementsStatusById(volume[0]).complete
                              <
                              measurementsStatusById(volume[0]).total">
                Проведены измерения (кол-во точек: {{measurementsStatusById(volume[0]).complete}})
              </div>
              <div class="badge bg-success" v-else>
                Проведены измерения (кол-во точек: {{measurementsStatusById(volume[0]).complete}})
              </div>
              <button type="button" class="btn btn-danger my-1 ms-2"
                  @click="$store.commit('volumes/removeById', volume[0])"
              >
                <i class="fa-solid fa-trash-can"></i>&nbsp;Удалить
              </button>
            </div>
          </div>
        </transition-group>
        <button class="btn btn-primary "
            @click="$store.commit('volumes/addEmpty')"
        >
          <i class="fa-solid fa-plus"></i>&nbsp;Добавить
        </button>
      </div>
    </div>
    <Warning v-if="noVolumes">Не задано ни одного ИЭО.</Warning>
    <Warning v-if="incorrectName">Некоторым ИЭО не присвоены названия.</Warning>
    <Warning v-if="nonUniqueNames">ИЭО имеют неуникальные названия</Warning>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import NumberInput from '../components/NumberInput.vue';
import Check from '../components/Check.vue';
import Warning from '../components/Warning.vue';

export default {
  components: {
    NumberInput,
    Check,
    Warning,
  },
  emits: ['stepFilledIncorrectly'],
  watch: {
    stepFilledIncorrectly(newValue) {
      this.$emit('stepFilledIncorrectly', newValue);
    },
  },
  computed: {
    ...mapGetters('volumes', ['noVolumes', 'incorrectName', 'nonUniqueNames', 'measurementsStatusById', 'incorrectTnom']),
    ...mapState({ volumes: (state) => state.volumes }),
    stepFilledIncorrectly() {
      return (
        this.noVolumes
        || this.incorrectName
        || this.nonUniqueNames
        || this.incorrectTnom
      );
    },
    d: { get() { return this.$store.state.equipment.d; }, set(value) { this.$store.commit('equipment/d', value); } },
    dMM: { get() { return this.$store.getters['equipment/dMM']; }, set(value) { this.$store.commit('equipment/dMM', value); } },
    incorrectd() { return this.$store.getters['equipment/incorrectd']; },
    D: { get() { return this.$store.state.equipment.D; }, set(value) { this.$store.commit('equipment/D', value); } },
    Dmm: { get() { return this.$store.getters['equipment/Dmm']; }, set(value) { this.$store.commit('equipment/Dmm', value); } },
    incorrectD() { return this.$store.getters['equipment/incorrectD']; },
  },
  methods: {},
  mounted() {
    this.$emit('stepFilledIncorrectly', this.stepFilledIncorrectly);
  },
};
</script>

<style lang="scss" scoped>

.volume-grid {
  display: grid;
  grid-gap: 12px;
  //grid-template-columns: repeat(auto-fill, minmax(350px, 500px));
  grid-template-columns: repeat(auto-fill, 360px);
  justify-content: space-between;
}
.volume-list-animation-move,
.volume-list-animation-enter-active,
.volume-list-animation-leave-active {
  transition: all 0.5s ease;
}
.volume-list-animation-enter-from,
.volume-list-animation-leave-to {
  opacity: 0;
  transform: scale(.1);
}
.volume-list-animation-leave-active {
  position: absolute;
}

</style>
