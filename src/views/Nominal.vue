<template>
  <div>
    <p>
      Заполните номинальные данные изделия из задания.
      Можно не заполнять текстовые поля, тогда в протоколе будет оставлено
      место для записи вручную.
    </p>
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
<!-- Производительность -->
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="Qnom" class="me-2">
        Производительность (требуемая или номинальная):
      </label>
      <div class="d-flex flex-column flex-sm-row
                  justify-content-between align-items-start align-items-sm-center
                  flex-fill"
      >
        <div class="input-group">
          <span class="input-group-text">Q<sub>ном</sub></span>
          <NumberInput id="Qnom" v-model="Qnom" tofixed="0" :invalid="incorrectQnom"/>
          <span class="input-group-text">м<sup>3</sup>/ч</span>
        </div>
        <div class="mx-2">или</div>
        <div class="input-group">
          <span class="input-group-text">Q<sub>ном</sub></span>
          <NumberInput v-model="QnomPerSecond" tofixed="3" :invalid="incorrectQnom"/>
          <span class="input-group-text">м<sup>3</sup>/с</span>
        </div>
      </div>
    </div>
<!-- Номинальное давление -->
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="Pnom" class="me-2">
        Избыточное давление воздуха (номинальное, максимальное или создаваемое):
      </label>
      <div class="d-flex flex-column flex-sm-row
                  justify-content-between align-items-start align-items-sm-center
                  flex-fill"
      >
        <div class="input-group">
          <span class="input-group-text">p<sub>ном</sub></span>
          <NumberInput id="Pnom" v-model="Pnom" tofixed="0" :invalid="incorrectPnom"/>
          <span class="input-group-text">Па</span>
        </div>
      </div>
    </div>
<!-- Атмосферное давление -->
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="Patm" class="me-2">
        Номинальное атмосферное давление на месте эксплуатации изделия:
      </label>
      <div class="d-flex flex-column flex-sm-row
                  justify-content-between align-items-start align-items-sm-center
                  flex-fill"
      >
        <div class="input-group">
          <span class="input-group-text">p<sub>атм</sub></span>
          <NumberInput id="Patm" v-model="Patm" tofixed="0" :invalid="incorrectPatm"/>
          <span class="input-group-text">Па</span>
        </div>
        <div class="mx-2">или</div>
        <div class="input-group">
          <span class="input-group-text">p<sub>атм</sub></span>
          <NumberInput v-model="PatmMMHg" tofixed="1" :invalid="incorrectPatm"/>
          <span class="input-group-text">мм рт.ст.</span>
        </div>
      </div>
    </div>
<!-- Температура окружения -->
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="tEnv" class="me-2">
        Максимальная температура окружающей среды при расположения:
      </label>
      <div class="input-group">
        <span class="input-group-text">t<sub>окр</sub></span>
        <NumberInput id="tEnv" v-model="tEnv" tofixed="1" :invalid="incorrectTenv"/>
        <span class="input-group-text">°C</span>
      </div>
    </div>
<!-- Негерметичность -->
    <div class="d-flex flex-column flex-lg-row
                justify-content-between align-items-stretch align-items-lg-center
                my-2"
      >
      <label for="Phi" class="me-2">
        Номинальная&nbsp;степень&nbsp;негерметичности:
      </label>
      <div class="input-group">
        <span class="input-group-text">φ<sub>ном</sub></span>
        <NumberInput id="Phi" v-model="phi" tofixed="2" :invalid="incorrectPhi"/>
        <span class="input-group-text">%</span>
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
        this.incorrectPhi
        || this.incorrectQnom
        || this.incorrectTenv
        || this.incorrectPatm
      );
    },
    name: { get() { return this.$store.state.nominals.name; }, set(value) { this.$store.commit('nominals/name', value); } },
    serial: { get() { return this.$store.state.nominals.serial; }, set(value) { this.$store.commit('nominals/serial', value); } },
    place: { get() { return this.$store.state.nominals.place; }, set(value) { this.$store.commit('nominals/place', value); } },
    phi: { get() { return this.$store.state.nominals.phi; }, set(value) { this.$store.commit('nominals/phi', value); } },
    incorrectPhi() { return this.$store.getters['nominals/incorrectPhi']; },
    Qnom: { get() { return this.$store.state.nominals.Qnom; }, set(value) { this.$store.commit('nominals/Qnom', value); } },
    QnomPerSecond: { get() { return this.$store.getters['nominals/QnomPerSecond']; }, set(value) { this.$store.commit('nominals/QnomPerSecond', value); } },
    incorrectQnom() { return this.$store.getters['nominals/incorrectQnom']; },
    tEnv: { get() { return this.$store.state.nominals.tEnv; }, set(value) { this.$store.commit('nominals/tEnv', value); } },
    incorrectTenv() { return this.$store.getters['nominals/incorrectTenv']; },
    Patm: { get() { return this.$store.state.nominals.Patm; }, set(value) { this.$store.commit('nominals/Patm', value); } },
    PatmMMHg: { get() { return this.$store.getters['nominals/PatmMMHg']; }, set(value) { this.$store.commit('nominals/PatmMMHg', value); } },
    incorrectPatm() { return this.$store.getters['nominals/incorrectPatm']; },
    Pnom: { get() { return this.$store.state.nominals.Pnom; }, set(value) { this.$store.commit('nominals/Pnom', value); } },
    incorrectPnom() { return this.$store.getters['nominals/incorrectPnom']; },
  },
  methods: {},
  mounted() {
    this.$emit('stepFilledIncorrectly', this.stepFilledIncorrectly);
  },
};
</script>
