import type { iInput } from '@lun/components';
import { delay } from '@lun/utils';

describe('defineCustomElement', () => {
  it('test boolean prop with default true', () => {
    cy.l('spin').then(([ce]) => {
    })
  })

  it('remove and append element with another element in it', () => {
    cy.l<iInput>('input').then(async ([ce]) => {
      const parent = ce.parentElement!;
      ce.remove();
      await delay(0);
      parent.append(ce);
      await delay(0);

      ce.remove();
      await delay(0);
      parent.append(ce);
      await delay(0);
    });
  });
});
