import { nextTick } from 'vue';

describe('Pagination', () => {
  const getButtons = (el: HTMLElement) => Array.from(el.shadowRoot!.firstElementChild!.children) as HTMLButtonElement[];
  const getPageTexts = (el: HTMLElement) => {
    const children = getButtons(el);
    children.shift(); // remove '<' control button
    children.pop(); // remove '>' control button
    return children.map((child) => (child as HTMLElement).innerText);
  };
  it('should render correctly with `pages`', () => {
    const ce = l('l-pagination', { pages: 3 });
    expect(getPageTexts(ce)).toEqual(['1', '2', '3']);
  });

  it('should render correctly with `pageSize` and `total`, should take precedence over `pages`', async () => {
    let current = 1;
    const onUpdate = (e: any) => {
      current = e.detail;
    };
    const ce = l('l-pagination', { pages: 3, pageSize: 10, total: 45, onUpdate });
    expect(getPageTexts(ce)).toEqual(['1', '2', '3', '4', '5']);
    const buttons = getButtons(ce);
    buttons[5].click();
    await nextTick();
    expect(current).toBe(5);
    expect(getPageTexts(ce)).toEqual(['1', '2', '3', '4', '5']);
    expect(getButtons(ce)[5].classList.contains('is-current')).to.be.true;
  });

  it('should show dots correctly', async () => {
    const ce = l('l-pagination', { pages: 20, siblings: 3, boundaries: 2, current: 10 });
    expect(getPageTexts(ce)).toEqual(['1', '2', '...', '7', '8', '9', '10', '11', '12', '13', '...', '19', '20']);
    getButtons(ce)[11].click(); // click right '...'
    await nextTick();
    expect(getPageTexts(ce)).toEqual(['1', '2', '...', '12', '13', '14', '15', '16', '17', '18', '19', '20']);
    getButtons(ce)[0].click(); // click '<'
    await nextTick();
    getButtons(ce)[3].click(); // click left '...'
    await nextTick();
    expect(getPageTexts(ce)).toEqual(['1', '2', '...', '6', '7', '8', '9', '10', '11', '12', '...', '19', '20']);
    getButtons(ce)[3].click(); // click left '...'
    await nextTick();
    expect(getPageTexts(ce)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '...', '19', '20']);
  });
});
