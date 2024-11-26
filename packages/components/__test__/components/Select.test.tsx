import { themeColors } from '@lun-web/components';
import { arrayFrom } from '@lun-web/utils';
import { userEvent } from '@vitest/browser/context';

const options = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2', disabled: true },
  { label: 'option3', value: 'value3' },
  { label: 'option4', value: 'value4' },
  { label: 'option5', value: 'value5' },
];

const groupOptions = [
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

const groupOptionsWithColors = [...groupOptions].map((groupOption, index) => ({
  ...groupOption,
  color: themeColors[themeColors.length - index - 1],
}));

describe('Select', () => {
  it('Single Select', async () => {
    let value = '';
    const onUpdate = vi.fn((e) => {
        value = e.detail.value;
      }),
      onClose = vi.fn();
    const ce = l('l-select', {
      options: options,
      value: 'value1',
      onUpdate,
      onClose,
    });

    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(50);
    // TODO seems it requires several re-renders so that input can have correct theme value. It's initially value1
    expect(ce.input.value).toBe('option1');
    const selectPanel = ce.popover.firstElementChild as HTMLElement;
    expect(selectPanel.className).toBe('l-select__content');
    expect(selectPanel.offsetWidth).toBe(0);
    const option3 = selectPanel.children[2] as any;
    expect(option3.label).toBe('option3');

    await userEvent.click(ce.input);
    await vi.waitFor(() => expect(selectPanel.offsetWidth).toBeGreaterThan(0));

    await userEvent.click(option3);
    expect(value).toBe('value3');

    // auto close
    // FIXME popover events are not re-emitted by select
    await vi.waitFor(() => expect(selectPanel.offsetWidth).toBe(0));
  });

  it('tags should inherit theme from option or optgroup', async () => {
    const ce = l('l-select', {
      options: groupOptionsWithColors,
      multiple: true,
      value: arrayFrom(5, (_, i) => `value${i + 1}`),
    });
    await vi.advanceTimersByTimeAsync(50);
    // TODO seems it requires several re-renders so that tags can have correct theme value
    const tags = ce.input.shadowRoot!.querySelectorAll('l-tag');
    expect(tags.length).toBe(5);
    expect(tags[0].color).toBe(groupOptionsWithColors[0].color);
    expect(tags[1].color).toBe(groupOptionsWithColors[0].color);
    expect(tags[2].color).toBe(groupOptionsWithColors[1].color);
    expect(tags[3].color).toBe(groupOptionsWithColors[1].color);
    expect(tags[4].color).toBe(groupOptionsWithColors[2].color);
  });

  it('select should be disabled if parent is disabled', async () => {
    const ce = l('l-theme-provider', {
      disabled: true,
      children: [['l-select']],
    });
    const select = ce.firstElementChild! as any;
    // this issue is caused by popoverProps. selectProps was not excluding 'disabled' from popoverProps
    expect(select._instance.props.disabled).to.be.undefined;
    expect(select.shadowRoot!.firstElementChild!.classList.contains('is-disabled')).to.be.true;
  });
});
