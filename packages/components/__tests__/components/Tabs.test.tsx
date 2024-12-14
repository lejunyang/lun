import { nextTick } from 'vue';

describe('Tabs', () => {
  it('should render correctly with items', async () => {
    let active = '';
    const onUpdate = vi.fn((e) => {
      active = e.detail;
    });
    const ce = l('l-tabs', {
        onUpdate,
        items: [
          {
            label: 'Tab 1',
            panel: 'Content 1',
            slot: 'tab-1',
          },
          {
            label: 'Tab 2',
            panel: 'Content 2',
            slot: 'tab-2',
          },
        ],
      }),
      root = ce.shadowRoot!;
    await nextTick();
    const content = root.querySelector('.l-tabs__content')!,
      tabsWrapper = root.querySelector('.l-tabs__wrapper')!;

    expect(content.children.length).toBe(1); // second panel is not rendered yet
    const first = content.children[0] as HTMLElement;
    expect(first.classList.contains('is-active')).to.be.true;
    expect(first.textContent).toBe('Content 1');

    expect(tabsWrapper.children.length).toBe(2);
    const firstTab = tabsWrapper.children[0] as HTMLElement,
      secondTab = tabsWrapper.children[1] as HTMLElement;
    expect(firstTab.textContent).toBe('Tab 1');
    expect(firstTab.classList.contains('is-active')).to.be.true;
    expect(secondTab.textContent).toBe('Tab 2');
    expect(secondTab.classList.contains('is-active')).to.be.false;

    // click on second tab
    secondTab.click();
    await nextTick();
    expect(content.children.length).toBe(2);
    const second = content.children[1] as HTMLElement;
    expect(first.classList.contains('is-active')).to.be.false;
    expect(second.classList.contains('is-active')).to.be.true;
    expect(second.textContent).toBe('Content 2');
    expect(firstTab.classList.contains('is-active')).to.be.false;
    expect(secondTab.classList.contains('is-active')).to.be.true;

    expect(onUpdate).toBeCalledTimes(1);
    expect(active).toBe('tab-2');
  });

  it('should render correctly with children l-tab-item', async () => {
    let active = '';
    const onUpdate = vi.fn((e) => {
      active = e.detail;
    });
    const ce = l('l-tabs', {
        onUpdate,
        children: [
          [
            'l-tab-item',
            {
              label: 'Tab 1',
              slot: 'tab-1',
            },
          ],
          [
            'l-tab-item',
            {
              label: 'Tab 2',
              slot: 'tab-2',
            },
          ],
        ],
      }),
      root = ce.shadowRoot!;
    await nextTick();
    const content = root.querySelector('.l-tabs__content')!,
      tabsWrapper = root.querySelector('.l-tabs__wrapper')!;
  
    // wait for the slots to be rendered
    await vi.waitFor(() => expect(content.children.length).toBe(2));
    const first = content.children[0] as HTMLSlotElement,
      second = content.children[1] as HTMLSlotElement;
    expect(first.name).toBe('tab-1');
    expect(second.name).toBe('tab-2');

    const firstItem = ce.children[0] as HTMLElement,
      firstRootEl = firstItem.shadowRoot!.firstElementChild!,
      secondItem = ce.children[1] as HTMLElement,
      secondRootEl = secondItem.shadowRoot!.firstElementChild!;
    
    expect(firstRootEl.classList.contains('is-hidden')).to.be.false;
    expect(secondRootEl.classList.contains('is-hidden')).to.be.true;

    expect(tabsWrapper.children.length).toBe(2);
    const firstTab = tabsWrapper.children[0] as HTMLElement,
      secondTab = tabsWrapper.children[1] as HTMLElement;
    expect(firstTab.textContent).toBe('Tab 1');
    expect(firstTab.classList.contains('is-active')).to.be.true;
    expect(secondTab.textContent).toBe('Tab 2');
    expect(secondTab.classList.contains('is-active')).to.be.false;

    // click on second tab
    secondTab.click();
    await nextTick();
    expect(firstRootEl.classList.contains('is-hidden')).to.be.true;
    expect(secondRootEl.classList.contains('is-hidden')).to.be.false;
    expect(firstTab.classList.contains('is-active')).to.be.false;
    expect(secondTab.classList.contains('is-active')).to.be.true;

    expect(onUpdate).toBeCalledTimes(1);
    expect(active).toBe('tab-2');
  });
});
