import React from 'react';
import { render } from 'vitest-browser-react';
import { LButton, LForm, LFormItem, LInput, useReactForm } from '../index';
import { userEvent } from '@vitest/browser/context';
import { iInput } from '@lun-web/components';
import '@lun-web/core/date-dayjs';

describe('react18', () => {
  it('should be 18', () => {
    expect(React.version.startsWith('18')).toBe(true);
  });

  it('should work with HTML attributes', () => {
    render(
      <LButton className="test-class" id="l-button" style={{ margin: 10 }}>
        button
      </LButton>,
    );
    const button = document.getElementById('l-button')!;
    expect(button).to.not.be.null;
    expect(button.className).to.equal('test-class');
    expect(button.style.margin).to.equal('10px');
  });

  it('should work with native event', async () => {
    const click = vi.fn();
    const { container } = render(<LButton onClick={click}>button</LButton>);
    const button = container.firstElementChild!;
    await userEvent.click(button);
    expect(click).toHaveBeenCalled();
  });

  it('innerStyle prop should work', () => {
    const { container } = render(<LButton innerStyle="button { color: red !important;}">button</LButton>);
    const lButton = container.firstElementChild!,
      button = lButton.shadowRoot!.firstElementChild as HTMLElement;
    expect(getComputedStyle(button).color).to.equal('rgb(255, 0, 0)');
  });

  it('useForm', async () => {
    let lInput: iInput | null;
    const Comp = () => {
      const instance = useReactForm(
        {
          defaultData: {
            input: '1',
          },
        },
        { renderOnUpdate: true },
      );
      return (
        <>
          <LForm instance={instance.current}>
            <LFormItem name="input">
              <LInput
                ref={(el) => {
                  lInput = el;
                }}
              />
            </LFormItem>
          </LForm>
          <div id="input-value">{instance.current.data.input as any}</div>
        </>
      );
    };
    render(<Comp />);

    expect(lInput!).to.not.be.null;
    const input = lInput!.shadowRoot!.querySelector('input')!;
    await userEvent.type(input, '2');
    expect(document.getElementById('input-value')!.textContent).to.equal('12');
  });
});
