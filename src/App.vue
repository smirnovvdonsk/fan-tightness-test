<template>
  <div class="d-flex flex-column justify-content-between
              background
              position-absolute h-100 w-100 m-0 p-2 pt-0"
  >
    <div class="d-print-none d-flex flex-row justify-content-between align-items-center my-0">
      <h3 class="me-auto">{{ currentStepName }}</h3>
      <button type="button" class="btn btn-danger m-1" @click="reset" title="Сбросить">
        <i class="fa-solid fa-trash-can"></i>
        <span class="d-none d-xl-inline"> Сбросить</span>
      </button>
      <button type="button" class="btn btn-primary m-1" @click="saveFile" title="Сохранить в файл">
        <i class="fa-solid fa-floppy-disk"></i>
        <span class="d-none d-xl-inline"> Сохранить в файл</span>
      </button>
      <input class="input-file" id="input-file"
               type="file" accept=".json" @change="readSingleFile"/>
      <label for="input-file" class="btn btn-primary ms-1" title="Загрузить из файла">
            <i class="fa-solid fa-upload"></i>
            <span class="d-none d-xl-inline"> Загрузить из файла</span>
      </label>
    </div>
    <div class="main-card h-100">
      <div>
        <router-view
          @stepFilledIncorrectly="OnStepFilledIncorrectly"
          class="mb-3"
          @click="saveCookie"
          @change="saveCookie"
          @blur="saveCookie"
        />
      </div>
    </div>
    <footer class="d-flex justify-content-between d-print-none mt-2 pb-1 px-0">
      <button
        @click="goPreviousStep"
        type="button"
        class="btn btn-primary me-auto"
        :disabled="cannotGoPreviousStep"
      >
        <i class="fa-solid fa-angle-left"></i>
        Назад
      </button>
      <Warning v-if="stepFilledIncorrectly" class="justify-self-end">
        Этот шаг содержит ошибки. Мы не можем двигаться далее
      </Warning>
      <button
        @click="goNextStep"
        type="button"
        class="btn btn-primary"
        :disabled="cannotGoNextStep"
      >
        <i class="fa-solid fa-angle-right"></i>
        Далее
      </button>
    </footer>
  </div>
</template>

<script>
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';

import {
  mapState, mapGetters, mapActions,
} from 'vuex';

import Warning from './components/Warning.vue';

export default {
  data() {
    return {
      stepFilledIncorrectly: false,
    };
  },
  components: { Warning },
  computed: {
    cannotGoPreviousStep() {
      return this.isTheFirstStep;
    },
    cannotGoNextStep() {
      return this.isTheLastStep || this.stepFilledIncorrectly;
    },
    ...mapGetters([
      'currentStepPath',
      'currentStepName',
      'isTheFirstStep',
      'isTheLastStep',
    ]),
    ...mapState([]),
    cookieName() { return 'fan-tightness-test'; },
  },
  methods: {
    OnStepFilledIncorrectly(value) {
      this.stepFilledIncorrectly = value;
    },
    ...mapActions(['setNextStep', 'setPreviousStep', 'import']),
    goCurrentStep() {
      this.$router.push(this.currentStepPath);
    },
    goNextStep() {
      this.stepFilledIncorrectly = false;
      this.setNextStep();
      this.saveCookie();
      this.goCurrentStep();
    },
    goPreviousStep() {
      this.stepFilledIncorrectly = false;
      this.setPreviousStep();
      this.saveCookie();
      this.goCurrentStep();
    },
    saveCookie() {
      localStorage.setItem(this.cookieName, JSON.stringify(this.$store.getters.export));
    },
    loadCookie() {
      try {
        const json = localStorage.getItem(this.cookieName);
        const obj = JSON.parse(json);
        this.import(obj);
      } catch {
        // console.log('no cookie');
      }
    },
    reset() {
      localStorage.removeItem(this.cookieName);
      window.location.reload();
    },
    saveFile() {
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(this.$store.getters.export)], { type: 'application/json' });
      a.href = URL.createObjectURL(file);
      a.download = 'tightness.json';
      a.click();
      a.remove();
    },
    readSingleFile(e) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = reader.result;
          const obj = JSON.parse(json);
          this.import(obj);
          this.goCurrentStep();
        } catch {
          // console.log('incorrect file');
        }
      };
      reader.readAsText(file);
    },
  },
  mounted() {
    this.loadCookie();
    this.goCurrentStep();
  },
};
</script>

<style lang="scss">
@import "./style.scss";

.background {
  background: $gray-100;
}

.main-card {
  @extend .mb-auto;
  background: white;
  scrollbar-color: $primary $dark;
  @media screen {
    padding: 1em;
    overflow-y: auto;
    // border: 1px solid #aaaaaa;
    border-radius: 0.2em;
    box-shadow: inset 1px -1px 10px #aaaaaa;
  }
}

.input-file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>
