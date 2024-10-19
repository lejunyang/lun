import type { iInput } from '@lun/components';

describe('Input', () => {
  it('type in input', () => {
    cy.l<iInput>('input').then(([ce]) => {
      cy.wrap(ce.input).type('Hello, World!');
    });
  });
});
