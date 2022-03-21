<template>

  <div class="form-check form-switch">
    <input
      class="form-check-input"
      type="checkbox" role="switch"
      :id="id"
      :checked="checked || modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.checked)"
    />
    <label class="form-check-label" :for="id">
      <slot></slot>
    </label>
  </div>

</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  data() {
    return {
      id: uuidv4(),
    };
  },
  props: {
    modelValue: Boolean,
    disabled: {
      type: [Boolean],
      default: false,
    },
    checked: {
      type: [Boolean],
      default: false,
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style scoped lang="scss">
</style>
