import { themeColors } from '@lun-web/components';
import { delay, ensureArray } from '@lun-web/utils';
import { ref } from 'vue';

// data for some code cases
export const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
  { label: 'option5', value: 'value5' },
];

export const optionsForSearch = [
  { label: 'Jack', value: 'value1' },
  { label: 'Jason', value: 'value2' },
  { label: 'John', value: 'value3' },
  { label: 'Joanna', value: 'value4' },
  { label: 'Joe', value: 'value5' },
];

export const optionsWithColors = [...options].map((option, index) => ({
  ...option,
  color: themeColors[themeColors.length - index - 1],
  disabled: undefined,
}));

export const groupOptions = [
  {
    label: 'group1',
    children: [
      { label: 'option1', value: 'value1' },
      { label: 'option2', value: 'value2', disabled: true },
    ],
  },
  {
    label: 'group2-very-long-name-very-long-name',
    children: [
      { label: 'option3', value: 'value3' },
      { label: 'option4', value: 'value4' },
    ],
  },
  { label: 'option5', value: 'value5' },
];

export const optionNameMap = {
  label: 'meaning',
  value: 'v',
  children: 'options',
};

export const renamedGroupOptions = groupOptions.map((groupOption) => ({
  meaning: groupOption.label,
  v: groupOption.value,
  options: groupOption.children?.map((option) => ({ meaning: option.label, v: option.value })),
}));

export const groupOptionsWithColors = [...groupOptions].map((groupOption, index) => ({
  ...groupOption,
  color: themeColors[themeColors.length - index - 1],
}));

export const optionsGetter = async () => {
  await delay(4000);
  return options;
};

export const sentence = 'The quick brown fox jumps over the lazy dog.';
export const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.`;
export const chText = `Lorem Ipsum，也称乱数假文或者哑元文本，是印刷及排版领域所常用的虚拟文字。由于曾经一台匿名的打印机刻意打乱了一盒印刷字体从而造出一本字体样品书，Lorem Ipsum从西元15世纪起就被作为此领域的标准文本使用。它不仅延续了五个世纪，还通过了电子排版的挑战，其雏形却依然保存至今。`;

export const growingProgress = ref(0);
setInterval(() => {
  if (growingProgress.value >= 100) growingProgress.value = 0;
  else growingProgress.value += 10;
}, 1500);

export const filesRenderer = (files) =>
  ensureArray(files)
    .map((file) => file.name)
    .join(', ');

export const treeItems = [
  {
    label: 'Item 1',
    value: '1',
    children: [
      {
        label: 'Item 1.1',
        value: '1.1',
        children: [
          { label: 'Item 1.1.1', value: '1.1.1' },
          { label: 'Item 1.1.2', value: '1.1.2' },
          { label: 'Item 1.1.3', value: '1.1.3', disabled: true },
        ],
      },
      { label: 'Item 1.2', value: '1.2' },
      {
        label: 'Item 1.3',
        value: '1.3',
        children: [{ label: 'Item 1.3.1', value: '1.3.1' }],
      },
    ],
  },
  {
    label: 'Item 2',
    value: '2',
  },
];
