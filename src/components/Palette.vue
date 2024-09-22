<template>
  <div class="container">
    <h1>自定义主题色</h1>
    <h6 class="gray">Base on <a href="https://www.radix-ui.com/colors/custom">@radix-ui/colors</a></h6>
    <div class="picker-container gray">
      Accent:
      <l-color-picker :defaultValue="defaultAccentHSL" no-alpha @update="updateAccent">
        <div class="picker"></div>
      </l-color-picker>
      Gray:
      <l-color-picker :defaultValue="defaultGrayHSL" no-alpha @update="updateGray">
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
    <details class="details custom-block" style="text-align: start">
      <summary>使用说明</summary>
      <p>
        得益于<a href="https://www.radix-ui.com/colors/custom" target="_blank">@radix-ui/colors</a
        >的优秀色彩设计，我们可以基于某个颜色去生成一系列的颜色：
      </p>
      <ul>
        <li>若应用只需某个固定的颜色，那么我们预先挑选并引入生成的样式，从而避免引入所有的颜色，大幅度减少样式体积</li>
        <li>
          若需要用户动态自定义颜色，则需引入全部颜色(约29kB
          gzip)，并需要<code>colorjs</code>和<code>bezier-easing</code>运行时，这大约需额外引入23kB(gzip)
        </li>
      </ul>
    </details>
    <div class="panel">
      <div class="panel-block">
        <l-input></l-input>
        <l-button variant="solid">Submit</l-button>
      </div>
      <div class="panel-block">
        <l-tag size="1" variant="soft">Soft</l-tag>
        <l-tag size="1" variant="surface">Surface</l-tag>
        <l-tag size="1" variant="outline">Outline</l-tag>
        <l-tag size="1" radius="full" high-contrast variant="soft">Soft</l-tag>
        <l-tag size="1" radius="full" high-contrast variant="surface">Surface</l-tag>
        <l-tag size="1" radius="full" high-contrast variant="outline">Outline</l-tag>
      </div>
      <l-tabs variant="solid" no-content :items="tabs"></l-tabs>
      <l-callout
        icon-name="info"
        variant="soft"
        description="This is description"
        style="display: block; width: 100%"
      ></l-callout>

      <l-form style="grid-column: 2" label-layout="vertical">
        <l-form-item label="Select" element="select"></l-form-item>
      </l-form>

      <div class="panel-block" style="grid-area: 2/3; flex-direction: column">
        <l-progress type="line" :value="growingProgress"></l-progress>
        <l-divider style="margin-block: 6px"></l-divider>
        <l-range value="40"></l-range>
      </div>

      <div style="grid-area: 3/1; display: flex; flex-direction: column; gap: 5px; align-self: start">
        <l-text as="blockquote">{{ text }}</l-text>
        <l-text as="blockquote" color="amber">{{ text }}</l-text>
        <l-text as="blockquote" color="tomato" gray-color="gray">{{ text }}</l-text>
      </div>

      <l-calendar style="grid-area: 3/3"></l-calendar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { text } from '../utils/data';
import { arrayFrom } from '@lun/utils';

const scales = arrayFrom(12, (_, i) => i + 1);

const tabs = [1, 2, 3, 4].map((i) => ({ slot: '' + i, label: `Tab ${i}` }));

// const defaultAccentRGB = [61, 99, 221];
const defaultAccentHSL = [225.75, 70.17543859649123, 55.294117647058826];
// const defaultGrayRBV = [139, 141, 152];
const defaultGrayHSL = [230.76923076923066, 5.936073059360735, 57.05882352941176];

const updateAccent = (e: CustomEvent) => {
  theme.color = e.detail;
};

const updateGray = (e: CustomEvent) => {
  theme['gray-color'] = e.detail;
};

const growingProgress = ref(0);
let timer: any;
onMounted(() => {
  timer = setInterval(() => {
    if (growingProgress.value >= 100) growingProgress.value = 0;
    else growingProgress.value += 10;
  }, 1500);
});
onBeforeUnmount(() => clearInterval(timer));

const theme = inject<{
  color: string;
  'gray-color': string;
}>('lun-theme');
</script>

<style scoped lang="scss">
ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 16px 0;
}
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
.picker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.picker {
  width: 30px;
  height: 30px;
  background: var(--l-color-picker-picked-color, var(--l-accent-a4));
  cursor: pointer;
  border-radius: var(--l-radius-4);
  outline: 1px solid var(--l-gray-a8);
  outline-offset: 1px;
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
.panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  justify-items: center;
  align-items: center;
  text-align: start;
}
.panel-block {
  display: flex;
  justify-content: center;
  gap: 4px;
  width: 100%;
}
</style>
