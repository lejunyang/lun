import { getDeepestActiveElement } from '@lun-web/utils';
import { userEvent } from '@vitest/browser/context';
import { iTag } from '@lun-web/components';

describe('Input', () => {
  it('type in input', async () => {
    let value = '';
    const onUpdate = vi.fn((e: any) => {
      value = e.detail;
    });
    const handlers = {
      onUpdate,
    };
    const ce = l('l-input', handlers);
    ce.focus();
    expect(ce.input?.tagName).to.equal('INPUT');
    expect(ce.input.matches(':focus')).to.be.true;
    await userEvent.type(ce.input, 'Hello');
    expect(value).to.equal('Hello');
    expect(onUpdate).toHaveBeenCalledTimes(5);
  });

  it('navigation and delete of multiple input through keyboard', async () => {
    let removed: (string | number)[], value: any;
    const onUpdate = vi.fn((e: any) => {
        value = e.detail;
      }),
      onTagsRemove = vi.fn((e) => {
        removed = e.detail;
      });
    const handlers = {
      onUpdate,
      onTagsRemove,
    };
    const ce = l('l-input', {
      multiple: true,
      value: [1, 2, 3],
      ...handlers,
    });
    ce.focus();

    const getTag = () => (getDeepestActiveElement()?.parentNode as ShadowRoot)?.host as iTag;

    // input should be focused
    expect(ce.input.matches(':focus')).to.be.true;
    await userEvent.keyboard('{ArrowLeft}');
    // arrow left should move to previous tag
    const tag3 = getTag();
    expect(tag3?.tagName).to.equal('L-TAG');
    expect(tag3?.label).to.equal('3');

    // move to tag2, then delete
    await userEvent.keyboard('{ArrowLeft}');
    const tag2 = getTag();
    expect(tag2?.tagName).to.equal('L-TAG');
    expect(tag2?.label).to.equal('2');
    await userEvent.keyboard('{Backspace}');
    expect(onUpdate).toHaveBeenCalled();
    expect(onTagsRemove).toHaveBeenCalled();
    expect(removed!).be.deep.equal([2]);
    expect(value).be.deep.equal([1, 3]);

    // after delete, tag3 should be focused
    const newTag3 = getTag();
    expect(newTag3?.tagName).to.equal('L-TAG');
    expect(newTag3?.label).to.equal('3');

    await userEvent.keyboard('{ArrowRight}');
    // arrow right should move to input
    expect(ce.input.matches(':focus')).to.be.true;
  });
});
