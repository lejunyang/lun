import { VueCustomRenderer } from '@lun-web/components';
import { render } from 'vitest-browser-vue';
import { defineComponent, nextTick, onBeforeUnmount, shallowReactive } from 'vue';

describe('CustomRenderer', () => {
  it('should render correctly with VueCustomRenderer', async () => {
    const container = l('div');
    const props = shallowReactive({
      content: 'Hello, World!' as any,
      type: 'vnode',
      preferHtml: false,
    });
    render(() => <VueCustomRenderer {...props} />, { container });
    await nextTick();
    expect(container.textContent).toBe('Hello, World!');

    props.content = 1244;
    await nextTick();
    expect(container.textContent).toBe('1244');

    const beforeUnmount = vi.fn();
    const Comp = defineComponent({
      setup() {
        onBeforeUnmount(beforeUnmount);
        return () => <span id="test">custom</span>;
      },
    });
    props.content = <Comp />;
    await nextTick();
    const custom = container.firstElementChild as HTMLSpanElement;
    expect(custom.tagName).toBe('SPAN');
    expect(custom.id).toBe('test');
    expect(custom.textContent).toBe('custom');

    Object.assign(props, { content: '<p>html</p>', type: 'html', preferHtml: true });
    await nextTick();
    expect(beforeUnmount).toBeCalledTimes(1);
    const wrapper = container.firstElementChild as HTMLDivElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.style.display).toBe('contents');
    await nextTick();
    expect(wrapper.innerHTML).toBe('<p>html</p>');
  });

  it('should render correctly with l-custom-renderer', async () => {
    const ce = l('l-custom-renderer', {
      content: 'Hello, World!',
    });
    await nextTick();
    expect(ce.shadowRoot).to.be.null;
    expect(ce.style.display).toBe('contents');
    expect(ce.textContent).toBe('Hello, World!');

    ce.content = 1244;
    await nextTick();
    expect(ce.textContent).toBe('1244');

    const beforeUnmount = vi.fn();
    const Comp = defineComponent({
      setup() {
        onBeforeUnmount(beforeUnmount);
        return () => <span id="test">custom</span>;
      },
    });
    ce.content = <Comp />;
    await nextTick();
    const custom = ce.firstElementChild as HTMLSpanElement;
    expect(custom.tagName).toBe('SPAN');
    expect(custom.id).toBe('test');
    expect(custom.textContent).toBe('custom');

    Object.assign(ce, { content: '<p>html</p>', type: 'html', preferHtml: true });
    await nextTick();
    expect(beforeUnmount).toBeCalledTimes(1);
    await nextTick();
    expect(ce.innerHTML).toBe('<p>html</p>');
  });
});
