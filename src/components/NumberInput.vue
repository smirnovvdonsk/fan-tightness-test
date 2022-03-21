<template>
  <input
    class="form-control py-0"
    :size="size"
    :class="{ 'is-invalid': cacheIsInvalid || invalid }"
    v-model="showingValue"
    @input="onInput"
    @blur="onBlur"
    :readonly="disabled || dashed"
  />
</template>

<script>
function prepareNumber(value) {
  let cache = value;
  switch (typeof cache) {
    case 'string':
      cache = +(+cache.replace(',', '.')); // Число
      if (Number.isNaN(cache)) cache = 0;
      break;
    case 'number':
      break;
    default:
      cache = 0;
  }
  // Имеем число в любом случае
  return cache;
}

export default {
  data() {
    return {
      cacheValue: '',
      commitTimer: null,
    };
  },
  props: {
    modelValue: Number,
    tofixed: {
      type: [Number, String],
      default: 2,
    },
    size: {
      type: [Number, String],
      default: 6,
    },
    dashed: {
      type: [Boolean],
      default: false,
    },
    disabled: {
      type: [Boolean],
      default: false,
    },
    invalid: {
      type: [Boolean],
      default: false,
    },
  },
  // Коммит делает немедленную коррекцию кэша
  // и отправляет откорректированное число, если оно является правильным.
  // Если нет, отправляется ноль.

  // OnInput делает отложенный коммит
  // OnBlur делает немедленный коммит

  // Watch проверяет, изменилось ли число, и переписывает кэш

  // Mounted переписывает кэш

  watch: {
    modelValue(newValue, oldValue) {
      try {
        if (this.toNumber(newValue) !== this.toNumber(oldValue)) {
          this.cacheValue = this.toString(newValue);
        }
      } catch {
        this.cacheValue = this.toString(0);
      }
    },
  },
  emits: ['update:modelValue'],
  methods: {
    correctCache() {
      this.cacheValue = this.cacheIsValid
        ? this.toString(this.cacheValue)
        : '0';
    },

    commit() {
      this.correctCache();
      this.$emit('update:modelValue', this.toNumber(this.cacheValue));
    },

    clearCommitTimer() {
      if (this.commitTimer) {
        clearTimeout(this.commitTimer);
        this.commitTimer = null;
      }
    },

    delayedCommit(delay = 0) {
      this.clearCommitTimer();
      this.commitTimer = setTimeout(this.commit, delay);
    },

    onInput() {
      this.delayedCommit(2000);
    },
    onBlur() {
      this.commit();
    },

    toString(value) {
      return prepareNumber(value).toFixed(this.tofixed).toString().replace('.', ',');
    },
    toNumber(value) {
      return prepareNumber(value);
    },
  },
  computed: {
    cacheIsInvalid() {
      // Введённое пользователем число некорректно
      return Number.isNaN(this.toNumber(this.cacheValue));
    },
    cacheIsValid() {
      // Введённое пользователем число корректно
      return !this.cacheIsInvalid;
    },
    showingValue: {
      get() {
        return this.dashed ? '-' : this.cacheValue;
      },
      set(value) {
        this.cacheValue = value;
      },
    },
  },
  mounted() {
    this.cacheValue = this.toString(this.modelValue);
  },
};
</script>

<style scoped lang="scss">
</style>
