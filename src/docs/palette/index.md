---
title: 调色
lang: zh-CN
sidebar: false
aside: false
pageClass: l-palette-page
---

# 自定义主题色

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
  <div v-for="scale in scales" class="color-block" :style="`background-color: var(--l-accent-gray-${scale});`"></div>
</div>

::: details 使用说明
得益于[@radix-ui/colors](https://www.radix-ui.com/colors)的优秀色彩设计，我们可以基于某个颜色去生成一系列的颜色：

- 若应用只需某个固定的颜色，那么我们预先挑选颜色并引入生成的样式，从而避免引入所有的颜色，大幅度减少样式体积
- 若需要用户动态自定义颜色，则需引入`import { importCustomDynamicColors } from '@lun-web/theme/custom'`
  这会引入全部颜色（约 29kB gzip）加上`colorjs`运行时（约 23kB gzip）。引入后主题属性中的`color`和`grayColor`将可以直接设置为用户选择的颜色，而不仅限于原先的关键字。该功能高度实验性，有待完善，背景色的自定义还未确定
  :::

<div class="panel">
  <div class="panel-block">
    <l-input :label="{
  interval: 2000,
  values: ['First label', 'very long label very long label very long', 'Third label'],
}" labelType="carousel"></l-input>
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

  <l-form style="grid-area: span 2 / 2; align-self: start;" label-layout="vertical" :instance="form">
    <l-form-item label="Select" name="select" element="select" :elementProps="{ options: groupOptions }"></l-form-item>
    <l-form-item v-bind="inputItemProps"></l-form-item>
    <l-form-item no-label>
      <div style="display: flex; justify-content: space-evenly; width: 100%; margin-top: 20px;">
        <l-button variant="ghost">Cancel</l-button>
        <l-button variant="solid">Submit</l-button>
      </div>
    </l-form-item>
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

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { text, groupOptions } from 'data';
import { arrayFrom } from '@lun-web/utils';
import { useForm } from '@lun-web/components'

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

const form = useForm({
  defaultData: {
    input: 21
  },
  defaultFormState: {
    statusMessages: {
      input: {
        error: ['数字必须小于20', '数字必须为偶数'],
        warning: ['最好在15～20之间'],
        success: ['数字必须大于10']
      }
    }
  }
});

const inputItemProps = {
  type: 'number',
  name: 'input',
  element: 'input',
  elementProps: {
    stepControl: 'plus-minus',
  },
  step: 1,
  label:"Input",
  tipType: "newLine",
  validateWhen: 'update',
  visibleStatuses: ['error', 'warning', 'success'],
  validators: (value) => {
    const moreThan10 = value > 10,
      lessThan20 = value < 20,
      even = value % 2 === 0,
      better = value > 15 && value < 20;
    return [
      { message: '数字必须大于10', status: moreThan10 ? 'success' : 'error' },
      { message: '数字必须小于20', status: lessThan20 ? 'success' : 'error' },
      better ? null : { message: '最好在15～20之间', status: 'warning' },
      { message: '数字必须为偶数', status: even ? 'success' : 'error' },
    ];
  },
}
</script>

<style lang="scss">
.l-palette-page {
  .VPDoc > .container > .content {
    max-width: 100% !important;
  }
  h1 {
  text-align: center;
}
.vp-doc > div {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  outline: 1.5px solid var(--l-color-picker-picked-color, var(--l-accent-a4));
  outline-offset: 2px;
}
.gray {
  color: var(--l-accent-gray-9);
  font-size: 12px;
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
}
</style>
