import { waitFrames } from '@lun-web/utils';
import { nextTick } from 'vue';

describe('Watermark', () => {
  it('props should be freezed', async () => {
    vi.useRealTimers();
    const div = l('div', {
      children: [
        [
          'l-watermark',
          {
            content: 'test',
            children: [
              [
                'div',
                {
                  id: 'children',
                  textContent: 'children',
                },
              ],
            ],
          },
        ],
        [
          'div',
          {
            id: 'anchor',
          },
        ],
      ],
    });
    await nextTick();
    const watermark = div.firstElementChild as HTMLElement;
    expect(watermark.shadowRoot).to.be.null;
    const style = watermark.style.cssText;
    watermark.style.display = 'none';
    await nextTick();
    expect(watermark.style.cssText).toBe(style);
    const children = document.getElementById('children')!,
      anchor = document.getElementById('anchor')!;

    watermark.remove();

    await waitFrames(2);
    const newWatermark = anchor.previousElementSibling as any;
    expect(newWatermark).to.be.not.null;
    expect(newWatermark.content).toBe('test');
    expect(newWatermark.children[0]).toBe(children);
  });
});
