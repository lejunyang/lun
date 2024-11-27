import { defineCustomElement } from '@lun-web/components';
import { useCEExpose } from 'hooks';
import { render } from 'vitest-browser-vue';
import { inject, nextTick, provide } from 'vue';

declare global {
  interface HTMLElementTagNameMap {
    'my-el': HTMLElement & { msg: string; text: (() => string) | undefined };
  }
}

describe('defineCustomElement', () => {
  const El = defineCustomElement({
    props: {
      msg: String,
      renderer: Function,
    },
    setup(props) {
      useCEExpose({
        text: () => props.msg,
      });
      provide('context', props);
      const context = inject('context', {}) as typeof props;
      return () => (props.renderer ? props.renderer(context, props) : context.msg || props.msg);
    },
  });
  customElements.define('my-el', El);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('test boolean prop with default true', async () => {
    const ce = l('l-spin'),
      root = ce.shadowRoot!;

    expect(root.firstElementChild?.tagName).toBe('svg');

    ce.spinning = false;
    await nextTick();
    expect(root.firstElementChild).toBeNull();

    ce.spinning = undefined;
    await nextTick();
    expect(root.firstElementChild?.tagName).toBe('svg');

    (ce as any).spinning = null;
    await nextTick();
    expect(root.firstElementChild).toBeNull();

    (ce as any).spinning = '';
    await nextTick();
    expect(root.firstElementChild?.tagName).toBe('svg');
  });

  it('move to another parent element', async () => {
    const el1 = l('my-el', { msg: 'el1' });
    const el2 = l('my-el', { msg: 'el2' });
    expect(el2.shadowRoot!.textContent).toBe('el2');
    el1.append(el2);
    await nextTick();
    expect(el2.shadowRoot!.textContent).toBe('el1');
  });

  it('remove element with child custom element and wait fully disconnected then append', async () => {
    vi.useRealTimers();
    let parent: InstanceType<typeof El>, child: InstanceType<typeof El>;
    render(() => (
      <div>
        <my-el
          msg="msg1"
          ref={(el: any) => {
            if (el) parent = el;
          }}
        >
          <my-el
            msg="msg2"
            ref={(el: any) => {
              if (el) child = el;
            }}
          ></my-el>
        </my-el>
      </div>
    ));
    let container = parent!.parentElement!;
    parent!.remove();
    await nextTick();
    await nextTick(); // wait two ticks for disconnect
    expect('text' in parent!).toBe(false);
    container.appendChild(parent!); // should not throw Error
    await nextTick();
    expect((parent! as any).text()).toBe('msg1');
    expect(parent!.shadowRoot!.textContent).toBe('msg1');
    expect(child!.shadowRoot!.textContent).toBe('msg1');
    parent!.setAttribute('msg', 'msg2');
    await nextTick();
    expect(parent!.shadowRoot!.textContent).toBe('msg2');
    await nextTick();
    expect(child!.shadowRoot!.textContent).toBe('msg2');
  });

  it('should resolve correct parent when element is slotted in nested context', async () => {
    l('my-el', {
      msg: 'GrandParent',
      renderer: () => {
        return (
          <my-el msg="Parent">
            <slot></slot>
          </my-el>
        );
      },
      children: [['my-el', { id: 'child' }]],
    });
    await nextTick();
    const child = document.getElementById('child')!;
    expect(child.shadowRoot!.textContent).toBe('Parent');
  });
});
