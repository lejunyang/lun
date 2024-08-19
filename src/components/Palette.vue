<template>
  <div class="container">
    <h1>自定义主题色</h1>
    <h6 class="gray">Base on <a href="https://www.radix-ui.com/colors/custom">@radix-ui/colors</a></h6>
    <div>
      Accent:
      <l-color-picker>
        <div class="picker"></div>
      </l-color-picker>
      Gray:
      <l-color-picker>
        <div class="picker"></div>
      </l-color-picker>
    </div>
    <div class="preview">
      <div class="label gray">Backgrounds</div>
      <div class="label-3 gray">Interactive components</div>
      <div class="label-3 gray">Borders and separators</div>
      <div class="label gray">Solid colors</div>
      <div class="label gray">Accessible text</div>
      <l-divider style="grid-column: span 12"></l-divider>
      <span v-for="scale in scales" class="gray">{{ scale }}</span>
      <div v-for="scale in scales" class="color-block" :style="`background-color: var(--l-accent-${scale});`"></div>
      <div v-for="scale in scales" class="color-block" :style="`background-color: var(--l-gray-${scale});`"></div>
    </div>
  </div>
</template>

<script setup>
const scales = Array(12)
  .fill(0)
  .map((_, i) => i + 1);
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin-inline: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
h1 {
  padding-top: 48px;
  font-size: 32px;
  line-height: 40px;
  font-weight: 600;
}
.picker {
  width: 48px;
  height: 48px;
  background: var(--l-color-picker-picked-color, var(--l-accent-a4));
  cursor: pointer;
}
.gray {
  color: var(--l-gray-9);
  font-size: 12px;
}
h6 {
  font-size: 16px;
}
.preview {
  display: grid;
  grid-template-columns: repeat(12, auto);
  justify-items: center;
  gap: 4px;

  .label {
    grid-column: span 2;
  }
  .label-3 {
    grid-column: span 3;
  }
  .color-block {
    height: 48px;
    width: 100%;
    max-width: 90px;
  }
}
</style>
