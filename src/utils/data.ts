import { delay, themeColors } from '@lun/components';

// data for some code cases
export const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
];
export const optionsWithColors = [...options].map((option, index) => ({
  ...option,
  color: themeColors[themeColors.length - index],
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
  { label: 'option4', value: 'value5' },
];

export const groupOptionsWithColors = [...groupOptions].map((groupOption, index) => ({
  ...groupOption,
  color: themeColors[themeColors.length - index],
}));

export const optionsGetter = async () => {
  await delay(4000);
  return options;
};

export const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.`;
