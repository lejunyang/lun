import { addUserComponent, defineCustomElement } from '@lun-web/components';
import { createCollector, isCollectedItemLeaf } from '@lun-web/core';
import { useCEExpose, useExpose } from 'hooks';
import { render } from 'vitest-browser-vue';
import { inject, nextTick, provide, Ref, ref } from 'vue';
import { getCollectorOptions } from '../../src/common/index';
import { getVmLeavesCount, getVmLevel } from 'utils';

declare global {
  interface HTMLElementTagNameMap {
    'l-test': HTMLElement & { msg: string; text: (() => string) | undefined };
  }
}

declare module '@lun-web/components' {
  interface UserComponents {
    open: 'test';
  }
}

describe('defineCustomElement', () => {
  addUserComponent('test');
  const TestCollector = createCollector({
    ...getCollectorOptions('test', true),
    tree: true,
  });
  const El = defineCustomElement({
    name: 'test',
    props: {
      msg: String,
      renderer: Function,
      parent: Boolean,
    },
    setup(props) {
      const collectorContext = props.parent ? TestCollector.parent() : TestCollector.child()!;
      useExpose(collectorContext);
      useCEExpose({
        text: () => props.msg,
      });
      provide('context', props);
      const context = inject('context', {}) as typeof props;
      return () => (props.renderer ? props.renderer(context, props) : context.msg || props.msg);
    },
  });
  type iEl = InstanceType<typeof El>;
  customElements.define('l-test', El);

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
    const el1 = l('l-test', { msg: 'el1' });
    const el2 = l('l-test', { msg: 'el2' });
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
        <l-test
          msg="msg1"
          ref={(el: any) => {
            if (el) parent = el;
          }}
        >
          <l-test
            msg="msg2"
            ref={(el: any) => {
              if (el) child = el;
            }}
          ></l-test>
        </l-test>
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
    l('l-test', {
      msg: 'GrandParent',
      renderer: () => {
        return (
          <l-test msg="Parent">
            <slot></slot>
          </l-test>
        );
      },
      children: [['l-test', { id: 'child' }]],
    });
    await nextTick();
    const child = document.getElementById('child')!;
    expect(child.shadowRoot!.textContent).toBe('Parent');
  });

  it('should have correct tree info for tree context', async () => {
    const firstChild = ref<iEl>(),
      leafChild = ref<iEl>();
    render(() => (
      <l-test parent>
        <l-test ref={firstChild}>
          <l-test>
            <l-test ref={leafChild}></l-test>
            <l-test></l-test>
          </l-test>
          <l-test>
            <l-test></l-test>
            <l-test></l-test>
          </l-test>
        </l-test>
      </l-test>
    ));
    await nextTick();
    const getVm = (r: Ref<iEl | undefined>) => r.value!._instance!;
    expect(isCollectedItemLeaf(getVm(firstChild))).to.be.false;
    expect(getVmLevel(getVm(firstChild))).toBe(0);
    expect(getVmLeavesCount(getVm(firstChild))).toBe(4);
    expect(isCollectedItemLeaf(getVm(leafChild))).to.be.true;
    expect(getVmLevel(getVm(leafChild))).toBe(2);
  });
});
