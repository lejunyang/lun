import React from 'react';
import { render } from 'vitest-browser-react';
import { LButton } from '../index';
import { userEvent } from '@vitest/browser/context';

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
    const { container } = render(
      <LButton onClick={click}>
        button
      </LButton>,
    );
    const button = container.firstElementChild!;
    await userEvent.click(button);
    expect(click).toHaveBeenCalled();
  })
});
