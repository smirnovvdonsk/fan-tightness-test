<template>
  <table :style="{
    display: width ? 'inline-table' : 'table',
    width: width ? '' : '100%'
  }">
    <tbody>
      <tr>
        <td class="handfield" :style="{width: width}">&nbsp;</td>
      </tr>
      <tr>
        <td class="handfield-suffix">
          <slot/>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: [
    'width',
  ],
};
</script>

<style lang="scss" scoped>
table {
  vertical-align: text-top;
  margin-bottom: 0.2em;
  .handfield {
    border-bottom: 1px solid black;
    line-height: 120%;
  }
  .handfield-suffix {
    text-align: center;
    font-size: 60%;
    padding: 0;
    margin: 0;
    line-height: 105%;
  }
}
</style>
