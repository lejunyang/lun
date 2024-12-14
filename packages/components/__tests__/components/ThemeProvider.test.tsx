import { render } from 'vitest-browser-vue';
import { nextTick } from 'vue';

describe('ThemeProvider', () => {
  it('theme inheritance', async () => {
    render(() => (
      <l-theme-provider
        color="red"
        appearance="dark"
        scale={1.1}
        grayColor="mauve"
        highContrast={true}
        size="3"
        radius="small"
      >
        <l-button id="button1"></l-button>
        <l-theme-provider>
          <l-button id="button2"></l-button>
          <l-theme-provider
            color="blue"
            appearance="light"
            scale={0.9}
            grayColor="sage"
            highContrast={false}
            size="1"
            radius="full"
          >
            <l-button id="button3"></l-button>
          </l-theme-provider>
        </l-theme-provider>
      </l-theme-provider>
    ));
    await nextTick();

    const button1 = document.getElementById('button1')!,
      button1Root = button1.shadowRoot!,
      button2 = document.getElementById('button2')!,
      button2Root = button2.shadowRoot!,
      button3 = document.getElementById('button3')!,
      button3Root = button3.shadowRoot!;
    expect(button1Root.firstElementChild!.classList.contains('l-color--red')).toBe(true);
    expect(button1Root.firstElementChild!.classList.contains('l-button--size-3')).toBe(true);
    expect(button1Root.firstElementChild!.classList.contains('is-dark')).toBe(true);
    expect((button1.computedStyleMap().get('--l-scale') as CSSUnparsedValue)?.[0]).toBe('1.1');

    // button2 should be same as button1, as its parent theme-provider doesn't provide anything
    expect(button2Root.firstElementChild!.classList.contains('l-color--red')).toBe(true);
    expect(button2Root.firstElementChild!.classList.contains('l-button--size-3')).toBe(true);
    expect(button2Root.firstElementChild!.classList.contains('is-dark')).toBe(true);
    expect((button2.computedStyleMap().get('--l-scale') as CSSUnparsedValue)?.[0]).toBe('1.1');

    expect(button3Root.firstElementChild!.classList.contains('l-color--blue')).toBe(true);
    expect(button3Root.firstElementChild!.classList.contains('l-button--size-1')).toBe(true);
    expect(button3Root.firstElementChild!.classList.contains('is-dark')).toBe(false);
    expect((button3.computedStyleMap().get('--l-scale') as CSSUnparsedValue)?.[0]).toBe('0.9');
  });
});
