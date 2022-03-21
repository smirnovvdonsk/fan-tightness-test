<template>
  <div>
    <p>Заполните данные об испытательном оборудовании.</p>
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="equipment-d" class="me-2">
        Диаметр отверстия диафрагмы:
      </label>
      <div class="d-flex flex-column flex-sm-row
                  justify-content-between align-items-start align-items-sm-center
                  flex-fill"
      >
        <div class="input-group">
          <span class="input-group-text">d</span>
          <NumberInput id="equipment-d" v-model="dMM" tofixed="1" :invalid="incorrectd"/>
          <span class="input-group-text">мм</span>
        </div>
        <div class="mx-2">или</div>
        <div class="input-group">
          <span class="input-group-text">d</span>
          <NumberInput v-model="d" tofixed="4" :invalid="incorrectd"/>
          <span class="input-group-text">м</span>
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="equipment-D" class="me-2">
        Внутренний диаметр измерительного трубопровода:
      </label>
      <div class="d-flex flex-column flex-sm-row
                  justify-content-between align-items-start align-items-sm-center
                  flex-fill"
      >
        <div class="input-group">
          <span class="input-group-text">D</span>
          <NumberInput id="equipment-D" v-model="Dmm" tofixed="1" :invalid="incorrectD"/>
          <span class="input-group-text">мм</span>
        </div>
        <div class="mx-2">или</div>
        <div class="input-group">
          <span class="input-group-text">D</span>
          <NumberInput v-model="D" tofixed="4" :invalid="incorrectD"/>
          <span class="input-group-text">м</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NumberInput from '../components/NumberInput.vue';

export default {
  components: {
    NumberInput,
  },
  emits: ['stepFilledIncorrectly'],
  watch: {
    stepFilledIncorrectly(newValue) {
      this.$emit('stepFilledIncorrectly', newValue);
    },
  },
  computed: {
    stepFilledIncorrectly() {
      return (
        this.incorrectd
        || this.incorrectD
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
