import { themeColors } from '@lun/components';
import { delay, toArrayIfNotNil } from '@lun/utils';
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

export const growingProgress = ref(0);
setInterval(() => {
  if (growingProgress.value >= 100) growingProgress.value = 0;
  else growingProgress.value += 10;
}, 1500);

export const filesRenderer = (files) =>
  toArrayIfNotNil(files)
    .map((file) => file.name)
    .join(', ');
